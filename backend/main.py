"""
T2V Near AI Agent Backend API.

This module provides a FastAPI backend for the T2V Near AI Agent,
offering health checks, example endpoints, and environment information.
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.controller import auth

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(
    title="T2V Near AI Agent Backend",
    description="Backend API for T2V Near AI Agent",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


routers = [
    auth.router,
]
for router in routers:  # routers_test
    app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
