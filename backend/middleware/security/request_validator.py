"""
Request validation middleware for comprehensive input validation.
"""

import json
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, ValidationError


class ValidationRule(BaseModel):
    """Individual validation rule configuration."""
    field: str
    required: bool = False
    max_length: Optional[int] = None
    min_length: Optional[int] = None
    pattern: Optional[str] = None
    allowed_values: Optional[List[Any]] = None
    data_type: str = "string"


class EndpointValidationConfig(BaseModel):
    """Validation configuration for specific endpoints."""
    method: str
    path: str
    rules: List[ValidationRule]
    strict_mode: bool = True


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for validating incoming requests."""

    def __init__(self, app, validation_configs: Optional[List[EndpointValidationConfig]] = None):
        super().__init__(app)
        self.validation_configs = validation_configs or []
        self._build_config_map()

    def _build_config_map(self):
        """Build a lookup map for validation configurations."""
        self.config_map = {}
        for config in self.validation_configs:
            key = f"{config.method.upper()}:{config.path}"
            self.config_map[key] = config

    async def dispatch(self, request: Request, call_next):
        """Validate request based on configured rules."""
        # Get validation config for this endpoint
        config = self._get_validation_config(request)
        
        if config:
            await self._validate_request(request, config)
        
        # Perform general security validation
        await self._general_security_validation(request)
        
        response = await call_next(request)
        return response

    def _get_validation_config(self, request: Request) -> Optional[EndpointValidationConfig]:
        """Get validation configuration for the current request."""
        method = request.method.upper()
        path = request.url.path
        
        # Exact match
        key = f"{method}:{path}"
        if key in self.config_map:
            return self.config_map[key]
        
        # Pattern matching for dynamic paths
        for config_key, config in self.config_map.items():
            config_path = config_key.split(":", 1)[1]
            if self._path_matches(path, config_path):
                return config
        
        return None

    def _path_matches(self, request_path: str, config_path: str) -> bool:
        """Check if request path matches configuration path pattern."""
        # Simple pattern matching - can be enhanced with regex
        if "{" in config_path:
            # Convert path parameters to regex pattern
            pattern = re.sub(r'\{[^}]+\}', r'[^/]+', config_path)
            return bool(re.match(f"^{pattern}$", request_path))
        return request_path == config_path

    async def _validate_request(self, request: Request, config: EndpointValidationConfig):
        """Validate request according to configuration."""
        # Get request data based on method
        request_data = await self._extract_request_data(request)
        
        validation_errors = []
        
        for rule in config.rules:
            error = self._validate_field(request_data, rule)
            if error:
                validation_errors.append(error)
        
        if validation_errors:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "Request validation failed",
                    "validation_errors": validation_errors
                }
            )

    async def _extract_request_data(self, request: Request) -> Dict:
        """Extract data from request for validation."""
        data = {}
        
        # Query parameters
        data.update(dict(request.query_params))
        
        # Path parameters
        if hasattr(request, "path_params"):
            data.update(request.path_params)
        
        # Body data for POST/PUT requests
        if request.method.upper() in ["POST", "PUT", "PATCH"]:
            try:
                content_type = request.headers.get("content-type", "")
                if "application/json" in content_type:
                    body = await request.body()
                    if body:
                        json_data = json.loads(body)
                        if isinstance(json_data, dict):
                            data.update(json_data)
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Invalid JSON will be caught by framework
                pass
        
        return data

    def _validate_field(self, data: Dict, rule: ValidationRule) -> Optional[Dict]:
        """Validate a single field according to rule."""
        field_value = data.get(rule.field)
        
        # Required field check
        if rule.required and (field_value is None or field_value == ""):
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' is required"
            }
        
        # Skip other validations if field is None and not required
        if field_value is None:
            return None
        
        # Data type validation
        if not self._validate_data_type(field_value, rule.data_type):
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' must be of type {rule.data_type}"
            }
        
        # Length validations
        if rule.max_length and len(str(field_value)) > rule.max_length:
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' exceeds maximum length of {rule.max_length}"
            }
        
        if rule.min_length and len(str(field_value)) < rule.min_length:
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' is below minimum length of {rule.min_length}"
            }
        
        # Pattern validation
        if rule.pattern and not re.match(rule.pattern, str(field_value)):
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' does not match required pattern"
            }
        
        # Allowed values validation
        if rule.allowed_values and field_value not in rule.allowed_values:
            return {
                "field": rule.field,
                "error": f"Field '{rule.field}' must be one of: {rule.allowed_values}"
            }
        
        return None

    def _validate_data_type(self, value: Any, expected_type: str) -> bool:
        """Validate data type of field value."""
        if expected_type == "string":
            return isinstance(value, str)
        elif expected_type == "integer":
            return isinstance(value, int)
        elif expected_type == "float":
            return isinstance(value, (int, float))
        elif expected_type == "boolean":
            return isinstance(value, bool)
        elif expected_type == "list":
            return isinstance(value, list)
        elif expected_type == "dict":
            return isinstance(value, dict)
        
        return True  # Unknown type, skip validation

    async def _general_security_validation(self, request: Request):
        """Perform general security validations."""
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=413,
                detail="Request payload too large"
            )
        
        # Check for suspicious patterns in headers
        for header_name, header_value in request.headers.items():
            if self._contains_suspicious_patterns(header_value):
                raise HTTPException(
                    status_code=400,
                    detail="Suspicious content detected in request headers"
                )