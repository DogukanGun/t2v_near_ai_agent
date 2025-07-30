"""
T2V Near AI Agent Backend API.

This module provides a FastAPI backend for the T2V Near AI Agent,
offering health checks, example endpoints, and environment information.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

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


class ExampleRequest(BaseModel):
    """Request model for example endpoint."""
    message: str


class ExampleResponse(BaseModel):
    """Response model for example endpoint."""
    received_message: str
    processed_message: str


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


@app.post("/api/example", response_model=ExampleResponse)
async def example_endpoint(request: ExampleRequest):
    """Example endpoint demonstrating request/response handling"""
    processed = f"Processed: {request.message}"

    return ExampleResponse(
        received_message=request.message, processed_message=processed
    )


@app.get("/api/environment")
async def get_environment_info():
    """Get environment information (for debugging)"""
    return {
        "python_version": os.sys.version,
        "environment_variables": {
            key: value
            for key, value in os.environ.items()
            if not key.startswith(("AWS_", "SECRET_", "PASSWORD_", "TOKEN_"))
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
