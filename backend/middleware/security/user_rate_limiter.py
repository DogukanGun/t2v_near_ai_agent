"""
User-specific rate limiting with tiered access controls.
"""

from enum import Enum
from typing import Dict, Optional
from fastapi import Request
from .rate_limiter import RateLimitMiddleware


class UserTier(Enum):
    """User access tiers with different rate limits."""
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"
    ADMIN = "admin"


class UserRateLimitConfig:
    """Configuration for user-specific rate limits."""
    
    TIER_LIMITS = {
        UserTier.FREE: {
            "default": {"limit": 100, "window": 3600},
            "endpoints": {
                "POST:/api/agent": {"limit": 10, "window": 3600},
                "GET:/api/profile": {"limit": 50, "window": 3600},
            }
        },
        UserTier.PREMIUM: {
            "default": {"limit": 500, "window": 3600},
            "endpoints": {
                "POST:/api/agent": {"limit": 100, "window": 3600},
                "GET:/api/profile": {"limit": 200, "window": 3600},
            }
        },
        UserTier.ENTERPRISE: {
            "default": {"limit": 2000, "window": 3600},
            "endpoints": {
                "POST:/api/agent": {"limit": 500, "window": 3600},
                "GET:/api/profile": {"limit": 1000, "window": 3600},
            }
        },
        UserTier.ADMIN: {
            "default": {"limit": 10000, "window": 3600},
            "endpoints": {}
        }
    }


class UserSpecificRateLimitMiddleware(RateLimitMiddleware):
    """Rate limiting middleware with user tier support."""

    def __init__(self, app):
        super().__init__(app)
        self.config = UserRateLimitConfig()

    def _get_endpoint_config(self, request: Request) -> Dict:
        """Get rate limit configuration based on user tier."""
        user_tier = self._get_user_tier(request)
        tier_config = self.config.TIER_LIMITS.get(user_tier, self.config.TIER_LIMITS[UserTier.FREE])
        
        path = request.url.path
        method = request.method.upper()
        endpoint_key = f"{method}:{path}"
        
        # Check for specific endpoint configuration
        if endpoint_key in tier_config["endpoints"]:
            return tier_config["endpoints"][endpoint_key]
        
        # Check for path pattern configuration
        for pattern, config in tier_config["endpoints"].items():
            if path.startswith(pattern.split(":")[1] if ":" in pattern else pattern):
                return config
        
        # Return default for tier
        return tier_config["default"]

    def _get_user_tier(self, request: Request) -> UserTier:
        """Determine user tier from request."""
        user_tier = getattr(request.state, "user_tier", None)
        if user_tier:
            try:
                return UserTier(user_tier)
            except ValueError:
                pass
        
        # Check for API key tier
        api_key_tier = getattr(request.state, "api_key_tier", None)
        if api_key_tier:
            try:
                return UserTier(api_key_tier)
            except ValueError:
                pass
        
        return UserTier.FREE

    def _get_rate_limit_key(self, request: Request) -> str:
        """Generate user-specific rate limit key."""
        user_id = getattr(request.state, "user_id", None)
        api_key_id = getattr(request.state, "api_key_id", None)
        
        if user_id:
            return f"user:{user_id}:{request.url.path}"
        elif api_key_id:
            return f"api_key:{api_key_id}:{request.url.path}"
        
        # Fallback to IP-based limiting
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}:{request.url.path}"