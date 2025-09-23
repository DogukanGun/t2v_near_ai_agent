"""
Base security middleware functionality and common utilities.
"""

import time
import uuid
from typing import Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class SecurityMiddleware(BaseHTTPMiddleware):
    """Base security middleware with common functionality."""

    def __init__(self, app, security_headers: bool = True):
        super().__init__(app)
        self.security_headers = security_headers

    async def dispatch(self, request: Request, call_next):
        """Process request with security headers and tracking."""
        request.state.request_id = str(uuid.uuid4())
        request.state.start_time = time.time()

        response = await call_next(request)

        if self.security_headers:
            self._add_security_headers(response)

        return response

    def _add_security_headers(self, response: Response) -> None:
        """Add standard security headers to response."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"