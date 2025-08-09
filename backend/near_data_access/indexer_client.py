"""
NEAR Indexer Client for accessing various NEAR indexing services.

This module provides a unified interface for accessing data from NEAR indexers
such as NEAR Lake and Pagoda Indexer.
"""

import logging
from typing import Dict, List, Optional, Any
import requests


class IndexerClient:
    """
    Client for accessing NEAR indexer services.
    
    Supports multiple indexers including NEAR Lake and Pagoda Indexer
    for retrieving on-chain data.
    """
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the indexer client.
        
        Args:
            network (str): The NEAR network ('mainnet' or 'testnet')
        """
        self.network = network
        self.logger = logging.getLogger(__name__)
        
        # NEAR Lake IndexerAPI endpoints
        if network == "mainnet":
            self.near_lake_endpoint = "https://api.near.page"
            self.pagoda_endpoint = "https://api.pagoda.co"
        else:
            self.near_lake_endpoint = "https://testnet.api.near.page" 
            self.pagoda_endpoint = "https://testnet.api.pagoda.co"
    
    def get_account_info(self, account_id: str) -> Optional[Dict[str, Any]]:
        """
        Get basic account information.
        
        Args:
            account_id (str): The NEAR account ID
            
        Returns:
            Optional[Dict[str, Any]]: Account information or None if not found
        """
        try:
            url = f"{self.near_lake_endpoint}/v1/accounts/{account_id}"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                self.logger.warning(f"Account {account_id} not found")
                return None
            else:
                self.logger.error(f"Error fetching account info: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            self.logger.error(f"Request failed for account {account_id}: {str(e)}")
            return None
    
    def get_transactions(self, account_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent transactions for an account.
        
        Args:
            account_id (str): The NEAR account ID
            limit (int): Maximum number of transactions to return
            
        Returns:
            List[Dict[str, Any]]: List of transaction data
        """
        try:
            url = f"{self.near_lake_endpoint}/v1/accounts/{account_id}/txns"
            params = {"limit": limit}
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("transactions", [])
            else:
                self.logger.error(f"Error fetching transactions: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            self.logger.error(f"Request failed for transactions {account_id}: {str(e)}")
            return []
    
    def get_contract_state(self, contract_id: str, method_name: str, args: Dict = None) -> Optional[Any]:
        """
        Query a smart contract's view method.
        
        Args:
            contract_id (str): The contract account ID
            method_name (str): The view method name
            args (Dict): Arguments for the method call
            
        Returns:
            Optional[Any]: Result of the view method call
        """
        try:
            url = f"{self.near_lake_endpoint}/v1/contracts/{contract_id}/call"
            payload = {
                "method_name": method_name,
                "args": args or {}
            }
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                return response.json().get("result")
            else:
                self.logger.error(f"Error calling contract method: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            self.logger.error(f"Request failed for contract call: {str(e)}")
            return None