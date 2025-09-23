"""
Security event logging middleware for monitoring and auditing.
"""

import json
import logging
import time
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class SecurityEventType(Enum):
    """Types of security events to log."""
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_REQUEST = "suspicious_request"
    AUTHENTICATION_FAILURE = "authentication_failure"
    AUTHORIZATION_FAILURE = "authorization_failure"
    CORS_VIOLATION = "cors_violation"
    INPUT_VALIDATION_FAILURE = "input_validation_failure"
    API_KEY_INVALID = "api_key_invalid"
    API_KEY_EXPIRED = "api_key_expired"
    LARGE_PAYLOAD = "large_payload"
    SQL_INJECTION_ATTEMPT = "sql_injection_attempt"
    XSS_ATTEMPT = "xss_attempt"
    PATH_TRAVERSAL_ATTEMPT = "path_traversal_attempt"
    COMMAND_INJECTION_ATTEMPT = "command_injection_attempt"


class SecurityLogger:
    """Security event logger with structured logging."""

    def __init__(self, log_level: str = "INFO"):
        self.logger = logging.getLogger("security")
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # Create formatter for structured logging
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for security events
        try:
            file_handler = logging.FileHandler('security_events.log')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
        except PermissionError:
            # Fallback if can't create log file
            pass

    def log_security_event(
        self,
        event_type: SecurityEventType,
        request: Request,
        details: Optional[Dict[str, Any]] = None,
        severity: str = "WARNING"
    ):
        """Log a security event with structured data."""
        event_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type.value,
            "severity": severity,
            "request_id": getattr(request.state, "request_id", "unknown"),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": dict(request.headers),
            "user_id": getattr(request.state, "user_id", None),
            "api_key_id": getattr(request.state, "api_key_id", None),
            "details": details or {}
        }
        
        # Log based on severity
        log_message = json.dumps(event_data, default=str)
        
        if severity == "CRITICAL":
            self.logger.critical(log_message)
        elif severity == "ERROR":
            self.logger.error(log_message)
        elif severity == "WARNING":
            self.logger.warning(log_message)
        else:
            self.logger.info(log_message)

    def log_rate_limit_exceeded(self, request: Request, limit: int, window: int):
        """Log rate limit exceeded event."""
        self.log_security_event(
            SecurityEventType.RATE_LIMIT_EXCEEDED,
            request,
            details={
                "limit": limit,
                "window": window,
                "client_ip": request.client.host if request.client else "unknown"
            },
            severity="WARNING"
        )

    def log_suspicious_request(self, request: Request, reason: str, patterns: list = None):
        """Log suspicious request pattern."""
        self.log_security_event(
            SecurityEventType.SUSPICIOUS_REQUEST,
            request,
            details={
                "reason": reason,
                "detected_patterns": patterns or []
            },
            severity="ERROR"
        )

    def log_authentication_failure(self, request: Request, auth_type: str):
        """Log authentication failure."""
        self.log_security_event(
            SecurityEventType.AUTHENTICATION_FAILURE,
            request,
            details={
                "auth_type": auth_type,
                "attempted_endpoint": request.url.path
            },
            severity="WARNING"
        )

    def log_api_key_event(self, request: Request, event_type: SecurityEventType, key_id: str = None):
        """Log API key related events."""
        self.log_security_event(
            event_type,
            request,
            details={
                "api_key_id": key_id,
                "endpoint": request.url.path
            },
            severity="WARNING"
        )

    def log_validation_failure(self, request: Request, validation_errors: list):
        """Log input validation failure."""
        self.log_security_event(
            SecurityEventType.INPUT_VALIDATION_FAILURE,
            request,
            details={
                "validation_errors": validation_errors,
                "request_data": "sanitized"  # Don't log actual data for security
            },
            severity="INFO"
        )


class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging security events and request metrics."""

    def __init__(self, app, log_level: str = "INFO"):
        super().__init__(app)
        self.security_logger = SecurityLogger(log_level)

    async def dispatch(self, request: Request, call_next):
        """Log request processing and security events."""
        start_time = time.time()
        
        # Log request start (for audit trail)
        self._log_request_start(request)
        
        try:
            response = await call_next(request)
            
            # Log successful response
            self._log_request_complete(request, response, start_time)
            
            return response
            
        except Exception as e:
            # Log exception details
            self._log_request_error(request, e, start_time)
            raise

    def _log_request_start(self, request: Request):
        """Log request initiation."""
        # Only log for sensitive endpoints or in debug mode
        sensitive_paths = ["/api/auth", "/api/admin", "/api/payment"]
        
        if any(request.url.path.startswith(path) for path in sensitive_paths):
            self.security_logger.logger.info(
                json.dumps({
                    "event": "request_start",
                    "timestamp": datetime.utcnow().isoformat(),
                    "request_id": getattr(request.state, "request_id", "unknown"),
                    "client_ip": request.client.host if request.client else "unknown",
                    "method": request.method,
                    "path": request.url.path,
                    "user_agent": request.headers.get("user-agent", "unknown")
                })
            )

    def _log_request_complete(self, request: Request, response: Response, start_time: float):
        """Log successful request completion."""
        duration = time.time() - start_time
        
        # Log slow requests as potential DoS attempts
        if duration > 5.0:  # 5 seconds threshold
            self.security_logger.log_security_event(
                SecurityEventType.SUSPICIOUS_REQUEST,
                request,
                details={
                    "reason": "slow_request",
                    "duration": duration,
                    "status_code": response.status_code
                },
                severity="WARNING"
            )
        
        # Log all requests to sensitive endpoints
        sensitive_paths = ["/api/auth", "/api/admin"]
        if any(request.url.path.startswith(path) for path in sensitive_paths):
            self.security_logger.logger.info(
                json.dumps({
                    "event": "request_complete",
                    "timestamp": datetime.utcnow().isoformat(),
                    "request_id": getattr(request.state, "request_id", "unknown"),
                    "status_code": response.status_code,
                    "duration": duration,
                    "path": request.url.path
                })
            )

    def _log_request_error(self, request: Request, error: Exception, start_time: float):
        """Log request errors."""
        duration = time.time() - start_time
        
        self.security_logger.logger.error(
            json.dumps({
                "event": "request_error",
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": getattr(request.state, "request_id", "unknown"),
                "error_type": type(error).__name__,
                "error_message": str(error),
                "duration": duration,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else "unknown"
            })
        )