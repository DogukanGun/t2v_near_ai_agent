"""
API Key authentication system for external integrations.
"""

import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel


class APIKey(BaseModel):
    """API Key model."""
    id: str
    name: str
    key_hash: str
    tier: str = "free"
    is_active: bool = True
    created_at: datetime
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    usage_count: int = 0
    allowed_ips: Optional[List[str]] = None
    allowed_endpoints: Optional[List[str]] = None


class APIKeyManager:
    """Manager for API key operations."""

    def __init__(self):
        # In-memory storage for demo - use database in production
        self.api_keys: Dict[str, APIKey] = {}
        self._initialize_default_keys()

    def _initialize_default_keys(self):
        """Initialize some default API keys for testing."""
        # Create a demo API key
        demo_key = self.create_api_key(
            name="Demo Key",
            tier="premium",
            expires_in_days=365
        )
        print(f"Demo API Key created: {demo_key['key']} (save this!)")

    def create_api_key(
        self,
        name: str,
        tier: str = "free",
        expires_in_days: Optional[int] = None,
        allowed_ips: Optional[List[str]] = None,
        allowed_endpoints: Optional[List[str]] = None
    ) -> Dict[str, str]:
        """Create a new API key."""
        # Generate secure random key
        key = f"ak_{secrets.token_urlsafe(32)}"
        key_hash = self._hash_key(key)
        
        # Create API key object
        api_key = APIKey(
            id=secrets.token_urlsafe(16),
            name=name,
            key_hash=key_hash,
            tier=tier,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=expires_in_days) if expires_in_days else None,
            allowed_ips=allowed_ips,
            allowed_endpoints=allowed_endpoints
        )
        
        # Store API key
        self.api_keys[key_hash] = api_key
        
        return {
            "id": api_key.id,
            "key": key,
            "tier": tier,
            "expires_at": api_key.expires_at.isoformat() if api_key.expires_at else None
        }

    def verify_api_key(self, key: str, client_ip: str = None, endpoint: str = None) -> Optional[APIKey]:
        """Verify API key and return key info if valid."""
        if not key or not key.startswith("ak_"):
            return None
        
        key_hash = self._hash_key(key)
        api_key = self.api_keys.get(key_hash)
        
        if not api_key:
            return None
        
        # Check if key is active
        if not api_key.is_active:
            return None
        
        # Check if key is expired
        if api_key.expires_at and api_key.expires_at < datetime.utcnow():
            return None
        
        # Check IP restrictions
        if api_key.allowed_ips and client_ip and client_ip not in api_key.allowed_ips:
            return None
        
        # Check endpoint restrictions
        if api_key.allowed_endpoints and endpoint:
            endpoint_allowed = any(
                endpoint.startswith(allowed) for allowed in api_key.allowed_endpoints
            )
            if not endpoint_allowed:
                return None
        
        # Update usage stats
        api_key.last_used_at = datetime.utcnow()
        api_key.usage_count += 1
        
        return api_key

    def revoke_api_key(self, key_id: str) -> bool:
        """Revoke an API key."""
        for api_key in self.api_keys.values():
            if api_key.id == key_id:
                api_key.is_active = False
                return True
        return False

    def list_api_keys(self) -> List[Dict]:
        """List all API keys (without sensitive data)."""
        return [
            {
                "id": api_key.id,
                "name": api_key.name,
                "tier": api_key.tier,
                "is_active": api_key.is_active,
                "created_at": api_key.created_at.isoformat(),
                "expires_at": api_key.expires_at.isoformat() if api_key.expires_at else None,
                "last_used_at": api_key.last_used_at.isoformat() if api_key.last_used_at else None,
                "usage_count": api_key.usage_count
            }
            for api_key in self.api_keys.values()
        ]

    def _hash_key(self, key: str) -> str:
        """Hash API key for secure storage."""
        return hashlib.sha256(key.encode()).hexdigest()


class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """Middleware for API key authentication."""

    def __init__(
        self,
        app,
        protected_paths: Optional[List[str]] = None,
        header_name: str = "X-API-Key",
        query_param_name: str = "api_key"
    ):
        super().__init__(app)
        self.api_key_manager = APIKeyManager()
        self.protected_paths = protected_paths or ["/api/"]
        self.header_name = header_name
        self.query_param_name = query_param_name

    async def dispatch(self, request: Request, call_next):
        """Authenticate API key for protected endpoints."""
        # Check if path requires API key authentication
        if not self._is_protected_path(request.url.path):
            return await call_next(request)

        # Extract API key from request
        api_key = self._extract_api_key(request)
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required",
                headers={"WWW-Authenticate": "API-Key"}
            )

        # Verify API key
        client_ip = request.client.host if request.client else None
        verified_key = self.api_key_manager.verify_api_key(
            api_key, client_ip, request.url.path
        )

        if not verified_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired API key"
            )

        # Add API key info to request state
        request.state.api_key_id = verified_key.id
        request.state.api_key_tier = verified_key.tier
        request.state.api_key_name = verified_key.name

        response = await call_next(request)
        
        # Add usage headers
        response.headers["X-API-Key-Usage"] = str(verified_key.usage_count)
        if verified_key.expires_at:
            response.headers["X-API-Key-Expires"] = verified_key.expires_at.isoformat()

        return response

    def _is_protected_path(self, path: str) -> bool:
        """Check if path requires API key authentication."""
        return any(path.startswith(protected) for protected in self.protected_paths)

    def _extract_api_key(self, request: Request) -> Optional[str]:
        """Extract API key from request headers or query parameters."""
        # Try header first
        api_key = request.headers.get(self.header_name)
        if api_key:
            return api_key

        # Try query parameter
        api_key = request.query_params.get(self.query_param_name)
        if api_key:
            return api_key

        # Try Authorization header (Bearer token format)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            if token.startswith("ak_"):
                return token

        return None