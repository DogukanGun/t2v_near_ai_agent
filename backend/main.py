"""
T2V Near AI Agent Backend API.

This module provides a FastAPI backend for the T2V Near AI Agent,
offering health checks, example endpoints, NEAR data access, and environment information.
"""

import os
import sys
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add near_data_access to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

try:
    from near_data_access import NEARDataClient
    data_access_available = True
except ImportError:
    NEARDataClient = None
    data_access_available = False

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(
    title="T2V Near AI Agent Backend",
    description="Backend API for T2V Near AI Agent with NEAR data access capabilities",
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

# Initialize NEAR data client
near_data_client = None
if data_access_available:
    try:
        near_data_client = NEARDataClient(network=os.getenv("NEAR_NETWORK", "mainnet"))
    except Exception as e:
        print(f"Warning: Failed to initialize NEAR data client: {e}")
        near_data_client = None


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


class AccountInfoRequest(BaseModel):
    """Request model for account info endpoint."""
    
    account_id: str
    include_balances: bool = True
    include_nfts: bool = True
    include_dao_activity: bool = True


class TokenBalanceRequest(BaseModel):
    """Request model for token balance endpoint."""
    
    account_id: str
    token_contract: Optional[str] = None


class NFTRequest(BaseModel):
    """Request model for NFT information endpoint."""
    
    contract_id: Optional[str] = None
    token_id: Optional[str] = None
    owner_id: Optional[str] = None


class DAORequest(BaseModel):
    """Request model for DAO information endpoint."""
    
    dao_id: str
    include_proposals: bool = False


class BlockchainQueryRequest(BaseModel):
    """Request model for general blockchain queries."""
    
    query: str
    search_type: str = "auto"


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
        "near_data_access_available": data_access_available,
        "near_network": os.getenv("NEAR_NETWORK", "mainnet"),
        "environment_variables": {
            key: value
            for key, value in os.environ.items()
            if not key.startswith(("AWS_", "SECRET_", "PASSWORD_", "TOKEN_"))
        },
    }


# NEAR Data Access Endpoints

@app.post("/api/near/account-info")
async def get_account_info(request: AccountInfoRequest):
    """Get comprehensive account information including balances, NFTs, and DAO activity"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        if request.include_balances or request.include_nfts or request.include_dao_activity:
            # Get full overview
            result = near_data_client.get_account_overview(request.account_id)
        else:
            # Get basic account info only
            result = near_data_client.indexer.get_account_info(request.account_id)
            
        if result is None:
            raise HTTPException(status_code=404, detail="Account not found")
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/near/token-balances")
async def get_token_balances(request: TokenBalanceRequest):
    """Get token balances for an account"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        if request.token_contract:
            # Get balance for specific token
            result = near_data_client.token.get_token_balance(request.account_id, request.token_contract)
            if result is None:
                return {"account_id": request.account_id, "token_contract": request.token_contract, "balance": "0"}
            return result
        else:
            # Get all token balances
            result = near_data_client.token.get_all_token_balances(request.account_id)
            return {"account_id": request.account_id, "balances": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/near/nft-info")
async def get_nft_info(request: NFTRequest):
    """Get NFT information by token ID or owner"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        if request.contract_id and request.token_id:
            # Get specific NFT
            result = near_data_client.nft.get_nft_by_token_id(request.contract_id, request.token_id)
            if result is None:
                raise HTTPException(status_code=404, detail="NFT not found")
            return result
        elif request.owner_id:
            # Get NFTs by owner
            result = near_data_client.nft.get_nfts_by_owner(request.owner_id)
            return {"owner_id": request.owner_id, "nfts": result}
        elif request.contract_id:
            # Get collection info
            result = near_data_client.nft.get_nft_collection_info(request.contract_id)
            if result is None:
                raise HTTPException(status_code=404, detail="NFT collection not found")
            return result
        else:
            raise HTTPException(status_code=400, detail="Must provide either (contract_id and token_id), owner_id, or contract_id")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/near/dao-info")
async def get_dao_info(request: DAORequest):
    """Get DAO information and proposals"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        result = near_data_client.dao.get_dao_info(request.dao_id)
        if result is None:
            raise HTTPException(status_code=404, detail="DAO not found")
            
        if request.include_proposals:
            proposals = near_data_client.dao.get_dao_proposals(request.dao_id, limit=10)
            result["recent_proposals"] = proposals
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/near/query")
async def query_blockchain_data(request: BlockchainQueryRequest):
    """General purpose blockchain data query"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        result = near_data_client.search_and_analyze(request.query, request.search_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/near/network-stats")
async def get_network_stats():
    """Get network statistics and supported features"""
    if not near_data_client:
        raise HTTPException(status_code=503, detail="NEAR data access not available")
    
    try:
        result = near_data_client.get_network_stats()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
