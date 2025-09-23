"""
Rate limiting middleware with Redis backend support.
"""

import asyncio
import time
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class InMemoryRateLimiter:
    """In-memory rate limiter implementation."""

    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.lock = asyncio.Lock()

    async def is_allowed(self, key: str, limit: int, window: int) -> Tuple[bool, Dict]:
        """Check if request is allowed based on rate limit."""
        async with self.lock:
            now = time.time()
            if key not in self.requests:
                self.requests[key] = []

            # Clean old requests
            self.requests[key] = [req_time for req_time in self.requests[key] 
                                if now - req_time < window]

            # Check limit
            current_count = len(self.requests[key])
            if current_count >= limit:
                reset_time = int(self.requests[key][0] + window)
                return False, {
                    "limit": limit,
                    "remaining": 0,
                    "reset": reset_time,
                    "window": window
                }

            # Add current request
            self.requests[key].append(now)
            return True, {
                "limit": limit,
                "remaining": limit - current_count - 1,
                "reset": int(now + window),
                "window": window
            }


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware."""

    def __init__(
        self,
        app,
        default_limit: int = 100,
        default_window: int = 3600,
        per_endpoint_limits: Optional[Dict[str, Dict]] = None
    ):
        super().__init__(app)
        self.default_limit = default_limit
        self.default_window = default_window
        self.per_endpoint_limits = per_endpoint_limits or {}
        self.rate_limiter = InMemoryRateLimiter()

    async def dispatch(self, request: Request, call_next):
        """Apply rate limiting to requests."""
        # Get rate limit configuration
        endpoint_config = self._get_endpoint_config(request)
        limit = endpoint_config.get("limit", self.default_limit)
        window = endpoint_config.get("window", self.default_window)

        # Generate rate limit key
        rate_limit_key = self._get_rate_limit_key(request)

        # Check rate limit
        allowed, stats = await self.rate_limiter.is_allowed(
            rate_limit_key, limit, window
        )

        if not allowed:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": stats["limit"],
                    "window": stats["window"],
                    "reset": stats["reset"]
                },
                headers={
                    "X-RateLimit-Limit": str(stats["limit"]),
                    "X-RateLimit-Remaining": str(stats["remaining"]),
                    "X-RateLimit-Reset": str(stats["reset"]),
                    "Retry-After": str(stats["reset"] - int(time.time()))
                }
            )

        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(stats["limit"])
        response.headers["X-RateLimit-Remaining"] = str(stats["remaining"])
        response.headers["X-RateLimit-Reset"] = str(stats["reset"])

        return response

    def _get_endpoint_config(self, request: Request) -> Dict:
        """Get rate limit configuration for endpoint."""
        path = request.url.path
        method = request.method.upper()
        
        # Check for specific endpoint configuration
        endpoint_key = f"{method}:{path}"
        if endpoint_key in self.per_endpoint_limits:
            return self.per_endpoint_limits[endpoint_key]
        
        # Check for path pattern configuration
        for pattern, config in self.per_endpoint_limits.items():
            if path.startswith(pattern.split(":")[1] if ":" in pattern else pattern):
                return config
                
        return {}

    def _get_rate_limit_key(self, request: Request) -> str:
        """Generate rate limit key for request."""
        # Use IP address as default key
        client_ip = request.client.host if request.client else "unknown"
        
        # Add user ID if available
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}:{request.url.path}"
        
        return f"ip:{client_ip}:{request.url.path}"