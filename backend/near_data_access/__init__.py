"""
NEAR Data Access Module.

This module provides functionality for accessing on-chain data from the NEAR blockchain,
including NFT information, DAO voting data, and token balances using various indexers.
"""

from .data_client import NEARDataClient
from .indexer_client import IndexerClient
from .nft_client import NFTClient
from .dao_client import DAOClient
from .token_client import TokenClient

__all__ = [
    "NEARDataClient",
    "IndexerClient", 
    "NFTClient",
    "DAOClient",
    "TokenClient"
]