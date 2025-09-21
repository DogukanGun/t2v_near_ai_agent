"""
Input sanitization middleware for preventing injection attacks and XSS.
"""

import html
import json
import re
from typing import Any, Dict, List, Union
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class InputSanitizer:
    """Utility class for sanitizing various types of input."""

    # Common suspicious patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'onclick\s*=',
        r'onmouseover\s*=',
        r'eval\s*\(',
        r'expression\s*\(',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
    ]

    SQL_INJECTION_PATTERNS = [
        r"(\s|^)(union|select|insert|delete|update|drop|create|alter|exec|execute)\s",
        r"(\s|^)(or|and)\s+\d+\s*=\s*\d+",
        r"'\s*(or|and)\s+'",
        r"--",
        r"/\*.*?\*/",
        r";\s*(drop|delete|truncate|alter)",
    ]

    COMMAND_INJECTION_PATTERNS = [
        r"[;&|`$(){}[\]<>]",
        r"\.\./",
        r"(cmd|command|exec|system|shell_exec|passthru|eval)",
    ]

    @classmethod
    def sanitize_string(cls, value: str, strict: bool = False) -> str:
        """Sanitize string input."""
        if not isinstance(value, str):
            return value

        # HTML encode to prevent XSS
        sanitized = html.escape(value, quote=True)

        if strict:
            # Remove potentially dangerous characters
            sanitized = re.sub(r'[<>"\'\`]', '', sanitized)

        return sanitized

    @classmethod
    def contains_suspicious_patterns(cls, value: str) -> bool:
        """Check if string contains suspicious patterns."""
        if not isinstance(value, str):
            return False

        value_lower = value.lower()

        # Check XSS patterns
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE | re.DOTALL):
                return True

        # Check SQL injection patterns
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True

        # Check command injection patterns
        for pattern in cls.COMMAND_INJECTION_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True

        return False

    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any], strict: bool = False) -> Dict[str, Any]:
        """Recursively sanitize dictionary data."""
        sanitized = {}
        
        for key, value in data.items():
            # Sanitize key
            sanitized_key = cls.sanitize_string(key, strict) if isinstance(key, str) else key
            
            # Sanitize value
            if isinstance(value, str):
                sanitized[sanitized_key] = cls.sanitize_string(value, strict)
            elif isinstance(value, dict):
                sanitized[sanitized_key] = cls.sanitize_dict(value, strict)
            elif isinstance(value, list):
                sanitized[sanitized_key] = cls.sanitize_list(value, strict)
            else:
                sanitized[sanitized_key] = value
        
        return sanitized

    @classmethod
    def sanitize_list(cls, data: List[Any], strict: bool = False) -> List[Any]:
        """Recursively sanitize list data."""
        sanitized = []
        
        for item in data:
            if isinstance(item, str):
                sanitized.append(cls.sanitize_string(item, strict))
            elif isinstance(item, dict):
                sanitized.append(cls.sanitize_dict(item, strict))
            elif isinstance(item, list):
                sanitized.append(cls.sanitize_list(item, strict))
            else:
                sanitized.append(item)
        
        return sanitized


class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """Middleware for sanitizing all incoming request data."""

    def __init__(
        self,
        app,
        strict_mode: bool = False,
        sanitize_query_params: bool = True,
        sanitize_json_body: bool = True,
        block_suspicious: bool = True
    ):
        super().__init__(app)
        self.strict_mode = strict_mode
        self.sanitize_query_params = sanitize_query_params
        self.sanitize_json_body = sanitize_json_body
        self.block_suspicious = block_suspicious
        self.sanitizer = InputSanitizer()

    async def dispatch(self, request: Request, call_next):
        """Sanitize request data before processing."""
        # Check for suspicious patterns first
        if self.block_suspicious:
            await self._check_suspicious_content(request)

        # Sanitize query parameters
        if self.sanitize_query_params:
            request = await self._sanitize_query_params(request)

        # Sanitize JSON body
        if self.sanitize_json_body:
            request = await self._sanitize_json_body(request)

        response = await call_next(request)
        return response

    async def _check_suspicious_content(self, request: Request):
        """Check for suspicious patterns in request data."""
        from fastapi import HTTPException
        
        # Check URL path
        if self.sanitizer.contains_suspicious_patterns(request.url.path):
            raise HTTPException(
                status_code=400,
                detail="Suspicious content detected in request path"
            )

        # Check query parameters
        for key, value in request.query_params.items():
            if (self.sanitizer.contains_suspicious_patterns(key) or 
                self.sanitizer.contains_suspicious_patterns(value)):
                raise HTTPException(
                    status_code=400,
                    detail="Suspicious content detected in query parameters"
                )

        # Check headers
        for header_name, header_value in request.headers.items():
            if (self.sanitizer.contains_suspicious_patterns(header_name) or 
                self.sanitizer.contains_suspicious_patterns(header_value)):
                raise HTTPException(
                    status_code=400,
                    detail="Suspicious content detected in request headers"
                )

    async def _sanitize_query_params(self, request: Request) -> Request:
        """Sanitize query parameters."""
        sanitized_params = {}
        
        for key, value in request.query_params.items():
            sanitized_key = self.sanitizer.sanitize_string(key, self.strict_mode)
            sanitized_value = self.sanitizer.sanitize_string(value, self.strict_mode)
            sanitized_params[sanitized_key] = sanitized_value

        # Update request query params
        from urllib.parse import urlencode
        new_query_string = urlencode(sanitized_params, doseq=True)
        
        # Create new URL with sanitized query string
        new_url = request.url.replace(query=new_query_string)
        request._url = new_url

        return request

    async def _sanitize_json_body(self, request: Request) -> Request:
        """Sanitize JSON body content."""
        if request.method.upper() not in ["POST", "PUT", "PATCH"]:
            return request

        content_type = request.headers.get("content-type", "")
        if "application/json" not in content_type:
            return request

        try:
            body = await request.body()
            if not body:
                return request

            # Parse JSON
            json_data = json.loads(body)
            
            # Sanitize based on data type
            if isinstance(json_data, dict):
                sanitized_data = self.sanitizer.sanitize_dict(json_data, self.strict_mode)
            elif isinstance(json_data, list):
                sanitized_data = self.sanitizer.sanitize_list(json_data, self.strict_mode)
            else:
                sanitized_data = json_data

            # Replace request body with sanitized data
            sanitized_body = json.dumps(sanitized_data).encode()
            
            # Create new request with sanitized body
            async def receive():
                return {
                    "type": "http.request",
                    "body": sanitized_body,
                    "more_body": False
                }
            
            request._receive = receive

        except (json.JSONDecodeError, UnicodeDecodeError):
            # Let the framework handle invalid JSON
            pass

        return request