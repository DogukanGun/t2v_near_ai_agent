"""
T2V Near AI Agent Backend API.

This module provides a FastAPI backend for the T2V Near AI Agent,
offering health checks, example endpoints, and environment information.
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.controller import agent, auth, profile
from middleware.security.base import SecurityMiddleware
from middleware.security.cors_config import CORSConfig
from middleware.security.user_rate_limiter import UserSpecificRateLimitMiddleware
from middleware.security.input_sanitizer import InputSanitizationMiddleware
from middleware.security.api_key_auth import APIKeyAuthMiddleware
from middleware.security.security_logger import SecurityLoggingMiddleware
from middleware.security.security_monitor import SecurityMonitoringMiddleware

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(
    title="API Project",
    description="Work in progress",
    version="0.1",
    swagger_ui_parameters={"docExpansion": "none"},
)

# Configure security middleware stack
# Order matters: security middleware should be added from outermost to innermost

# 1. Security monitoring (outermost - monitors all requests)
app.add_middleware(SecurityMonitoringMiddleware, enable_monitoring=True)

# 2. Security logging
app.add_middleware(SecurityLoggingMiddleware, log_level="INFO")

# 3. Base security headers
app.add_middleware(SecurityMiddleware, security_headers=True)

# 4. CORS with production-ready configuration
cors_config = CORSConfig()
cors_config.create_cors_middleware(app)

# 5. Rate limiting with user-specific tiers
app.add_middleware(UserSpecificRateLimitMiddleware)

# 6. Input sanitization
app.add_middleware(
    InputSanitizationMiddleware,
    strict_mode=False,
    sanitize_query_params=True,
    sanitize_json_body=True,
    block_suspicious=True
)

# 7. API key authentication (innermost - closest to routes)
app.add_middleware(
    APIKeyAuthMiddleware,
    protected_paths=["/api/agent", "/api/profile"],
    header_name="X-API-Key",
    query_param_name="api_key"
)


# Pydantic models
class HealthResponse(BaseModel):
    """Response model for health check endpoints."""

    status: str
    message: str


# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(
        status="healthy", message="T2V Near AI Agent Backend is running"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="healthy", message="Service is up and running")


@app.get("/security/stats")
async def security_stats():
    """Get security monitoring statistics"""
    # This endpoint would typically require admin authentication
    from fastapi import Depends
    
    # Get security stats from monitoring middleware
    # Note: In a real implementation, you'd access the middleware instance
    return {
        "message": "Security monitoring active",
        "features": [
            "Rate limiting with user tiers",
            "Input sanitization and validation", 
            "API key authentication",
            "Security event logging",
            "Real-time threat monitoring",
            "CORS protection",
            "Security headers"
        ]
    }


routers = [auth.router, agent.router, profile.router]
for router in routers:  # routers_test
    app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
