"""
Main NEAR Data Client for unified access to NEAR blockchain data.

This module provides a unified interface that combines all data access
clients for easy use by the AI agent and API endpoints.
"""

import logging
from typing import Dict, List, Optional, Any

from .indexer_client import IndexerClient
from .nft_client import NFTClient
from .dao_client import DAOClient
from .token_client import TokenClient


class NEARDataClient:
    """
    Unified client for accessing NEAR blockchain data.
    
    Combines IndexerClient, NFTClient, DAOClient, and TokenClient
    to provide a single interface for all NEAR data operations.
    """
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the NEAR data client.
        
        Args:
            network (str): The NEAR network ('mainnet' or 'testnet')
        """
        self.network = network
        self.logger = logging.getLogger(__name__)
        
        # Initialize all client modules
        self.indexer = IndexerClient(network)
        self.nft = NFTClient(network)
        self.dao = DAOClient(network)
        self.token = TokenClient(network)
    
    def get_account_overview(self, account_id: str) -> Dict[str, Any]:
        """
        Get comprehensive overview of an account including balances, NFTs, and DAO activity.
        
        Args:
            account_id (str): The NEAR account ID
            
        Returns:
            Dict[str, Any]: Complete account overview
        """
        try:
            overview = {
                "account_id": account_id,
                "network": self.network,
                "timestamp": None
            }
            
            # Get basic account info
            account_info = self.indexer.get_account_info(account_id)
            overview["account_info"] = account_info
            
            # Get token balances
            token_balances = self.token.get_all_token_balances(account_id)
            overview["token_balances"] = token_balances
            
            # Get NFTs (limited to avoid long response times)
            nfts = self.nft.get_nfts_by_owner(account_id, limit=5)
            overview["nfts"] = nfts
            overview["nft_count"] = len(nfts)
            
            # Get DAO activity (limited)
            dao_activity = self.dao.get_user_dao_activity(account_id, limit=5)
            overview["dao_activity"] = dao_activity
            
            # Get recent transactions (limited)
            recent_transactions = self.indexer.get_transactions(account_id, limit=5)
            overview["recent_transactions"] = recent_transactions
            
            return overview
            
        except Exception as e:
            self.logger.error(f"Error generating account overview for {account_id}: {str(e)}")
            return {
                "account_id": account_id,
                "error": str(e),
                "network": self.network
            }
    
    def search_and_analyze(self, query: str, search_type: str = "auto") -> Dict[str, Any]:
        """
        Search and analyze NEAR data based on a query.
        
        Args:
            query (str): Search query (account ID, token symbol, DAO name, etc.)
            search_type (str): Type of search ('auto', 'account', 'token', 'dao', 'nft')
            
        Returns:
            Dict[str, Any]: Search results and analysis
        """
        try:
            results = {
                "query": query,
                "search_type": search_type,
                "results": {}
            }
            
            if search_type == "auto":
                # Auto-detect what the query might be
                if "." in query and query.count(".") >= 1:
                    # Looks like an account ID
                    search_type = "account"
                elif query.upper() in ["NEAR", "USDC", "USDT", "WETH", "REF", "AURORA"]:
                    # Known token symbol
                    search_type = "token"
                elif "dao" in query.lower():
                    search_type = "dao"
                else:
                    # Try multiple types
                    search_type = "multi"
            
            if search_type == "account" or search_type == "multi":
                account_data = self.get_account_overview(query)
                if account_data and "error" not in account_data:
                    results["results"]["account"] = account_data
            
            if search_type == "token" or search_type == "multi":
                token_data = self.token.get_token_info(query)
                if token_data:
                    results["results"]["token"] = token_data
                
                # Search for tokens
                token_search = self.token.search_tokens(query)
                if token_search:
                    results["results"]["token_search"] = token_search
            
            if search_type == "dao" or search_type == "multi":
                dao_data = self.dao.get_dao_info(query)
                if dao_data:
                    results["results"]["dao"] = dao_data
            
            if search_type == "nft" or search_type == "multi":
                if "." in query:
                    # Might be NFT contract
                    nft_collection = self.nft.get_nft_collection_info(query)
                    if nft_collection:
                        results["results"]["nft_collection"] = nft_collection
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in search and analyze for query '{query}': {str(e)}")
            return {
                "query": query,
                "error": str(e)
            }
    
    def get_network_stats(self) -> Dict[str, Any]:
        """
        Get general network statistics and information.
        
        Returns:
            Dict[str, Any]: Network statistics
        """
        try:
            stats = {
                "network": self.network,
                "supported_features": [
                    "account_info",
                    "token_balances", 
                    "nft_data",
                    "dao_governance",
                    "transaction_history"
                ],
                "known_tokens": list(self.token.token_contracts.keys()),
                "known_daos": list(self.dao.dao_contracts.keys())
            }
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Error getting network stats: {str(e)}")
            return {"error": str(e)}
    
    # Convenience methods that delegate to specific clients
    
    def get_token_balance(self, account_id: str, token: str) -> Optional[Dict[str, Any]]:
        """Get token balance (convenience method)."""
        return self.token.get_token_balance(account_id, token)
    
    def get_nft_info(self, contract_id: str, token_id: str) -> Optional[Dict[str, Any]]:
        """Get NFT information (convenience method)."""
        return self.nft.get_nft_by_token_id(contract_id, token_id)
    
    def get_dao_proposals(self, dao_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get DAO proposals (convenience method)."""
        return self.dao.get_dao_proposals(dao_id, limit)
    
    def get_account_transactions(self, account_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get account transactions (convenience method)."""
        return self.indexer.get_transactions(account_id, limit)