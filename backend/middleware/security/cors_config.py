"""
Production-ready CORS configuration with environment-based settings.
"""

import os
from typing import List, Union
from fastapi.middleware.cors import CORSMiddleware


class CORSConfig:
    """CORS configuration manager."""

    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.allowed_origins = self._get_allowed_origins()

    def _get_allowed_origins(self) -> List[str]:
        """Get allowed origins based on environment."""
        if self.environment == "production":
            # Production origins from environment variables
            origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
            origins = [origin.strip() for origin in origins if origin.strip()]
            
            # Always include the main frontend URL
            if self.frontend_url not in origins:
                origins.append(self.frontend_url)
            
            return origins
        elif self.environment == "staging":
            return [
                self.frontend_url,
                "https://staging.yourdomain.com",
                "https://preview.yourdomain.com"
            ]
        else:
            # Development environment - more permissive
            return [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                self.frontend_url
            ]

    def get_cors_kwargs(self) -> dict:
        """Get CORS middleware configuration."""
        if self.environment == "production":
            return {
                "allow_origins": self.allowed_origins,
                "allow_credentials": True,
                "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": [
                    "Accept",
                    "Accept-Language",
                    "Content-Language",
                    "Content-Type",
                    "Authorization",
                    "X-Requested-With",
                    "X-API-Key",
                    "X-CSRF-Token"
                ],
                "expose_headers": [
                    "X-RateLimit-Limit",
                    "X-RateLimit-Remaining",
                    "X-RateLimit-Reset",
                    "X-Request-ID"
                ],
                "max_age": 86400  # 24 hours
            }
        else:
            # Development/staging - more permissive for debugging
            return {
                "allow_origins": self.allowed_origins,
                "allow_credentials": True,
                "allow_methods": ["*"],
                "allow_headers": ["*"],
                "expose_headers": [
                    "X-RateLimit-Limit",
                    "X-RateLimit-Remaining",
                    "X-RateLimit-Reset",
                    "X-Request-ID"
                ],
                "max_age": 86400
            }

    def create_cors_middleware(self, app):
        """Create and configure CORS middleware."""
        cors_config = self.get_cors_kwargs()
        app.add_middleware(CORSMiddleware, **cors_config)
        return app


class SecurityCORSMiddleware(CORSMiddleware):
    """Enhanced CORS middleware with additional security features."""

    def __init__(self, app, **kwargs):
        # Add security-focused defaults
        security_defaults = {
            "allow_credentials": True,
            "max_age": 86400,
        }
        
        # Merge with provided kwargs
        final_kwargs = {**security_defaults, **kwargs}
        super().__init__(app, **final_kwargs)

    async def dispatch(self, request, call_next):
        """Enhanced CORS handling with security logging."""
        origin = request.headers.get("origin")
        
        # Log suspicious CORS requests in production
        if os.getenv("ENVIRONMENT") == "production" and origin:
            allowed_origins = getattr(self, "allow_origins", [])
            if origin not in allowed_origins and allowed_origins != ["*"]:
                # Log potential CORS attack
                print(f"SECURITY: Blocked CORS request from unauthorized origin: {origin}")
        
        return await super().dispatch(request, call_next)