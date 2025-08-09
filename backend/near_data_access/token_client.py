"""
Token Client for accessing token balance and information on NEAR blockchain.

This module provides functionality to retrieve token balances,
metadata, and transaction history for fungible tokens.
"""

import logging
from typing import Dict, List, Optional, Any
from .indexer_client import IndexerClient


class TokenClient:
    """
    Client for accessing token data on NEAR blockchain.
    
    Provides methods to query token balances, metadata, and transaction history.
    """
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the token client.
        
        Args:
            network (str): The NEAR network ('mainnet' or 'testnet')
        """
        self.network = network
        self.indexer = IndexerClient(network)
        self.logger = logging.getLogger(__name__)
        
        # Known token contracts
        self.token_contracts = {
            "USDC": "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
            "USDT": "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
            "WETH": "c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near",
            "WRAP": "wrap.near",
            "REF": "token.v2.ref-finance.near",
            "AURORA": "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
        }
    
    def get_token_balance(self, account_id: str, token_contract: str) -> Optional[Dict[str, Any]]:
        """
        Get token balance for an account.
        
        Args:
            account_id (str): The account ID to check
            token_contract (str): The token contract ID
            
        Returns:
            Optional[Dict[str, Any]]: Balance information or None if error
        """
        try:
            # Handle NEAR native token
            if token_contract.lower() == "near" or token_contract == "wrap.near":
                account_info = self.indexer.get_account_info(account_id)
                if account_info:
                    balance_yocto = account_info.get("amount", "0")
                    balance_near = float(balance_yocto) / 10**24
                    
                    return {
                        "account_id": account_id,
                        "token_contract": "near",
                        "balance": str(balance_yocto),
                        "balance_formatted": f"{balance_near:.4f}",
                        "decimals": 24,
                        "symbol": "NEAR"
                    }
            else:
                # Handle fungible tokens
                balance = self.indexer.get_contract_state(
                    token_contract,
                    "ft_balance_of",
                    {"account_id": account_id}
                )
                
                if balance is not None:
                    # Get token metadata for formatting
                    metadata = self.get_token_metadata(token_contract)
                    decimals = metadata.get("decimals", 0) if metadata else 0
                    symbol = metadata.get("symbol", "UNKNOWN") if metadata else "UNKNOWN"
                    
                    balance_formatted = float(balance) / (10 ** decimals) if decimals > 0 else float(balance)
                    
                    return {
                        "account_id": account_id,
                        "token_contract": token_contract,
                        "balance": str(balance),
                        "balance_formatted": f"{balance_formatted:.4f}",
                        "decimals": decimals,
                        "symbol": symbol,
                        "metadata": metadata
                    }
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching balance for {account_id} on {token_contract}: {str(e)}")
            return None
    
    def get_all_token_balances(self, account_id: str) -> List[Dict[str, Any]]:
        """
        Get balances for all known tokens for an account.
        
        Args:
            account_id (str): The account ID to check
            
        Returns:
            List[Dict[str, Any]]: List of token balances
        """
        balances = []
        
        # Get NEAR balance first
        near_balance = self.get_token_balance(account_id, "near")
        if near_balance:
            balances.append(near_balance)
        
        # Get balances for known tokens
        for symbol, contract in self.token_contracts.items():
            try:
                balance = self.get_token_balance(account_id, contract)
                if balance and float(balance["balance"]) > 0:
                    balance["symbol"] = symbol
                    balances.append(balance)
            except Exception as e:
                self.logger.warning(f"Error checking {symbol} balance: {str(e)}")
        
        return balances
    
    def get_token_metadata(self, token_contract: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a token contract.
        
        Args:
            token_contract (str): The token contract ID
            
        Returns:
            Optional[Dict[str, Any]]: Token metadata or None if not found
        """
        try:
            metadata = self.indexer.get_contract_state(token_contract, "ft_metadata", {})
            return metadata
            
        except Exception as e:
            self.logger.error(f"Error fetching metadata for {token_contract}: {str(e)}")
            return None
    
    def get_token_transfers(self, account_id: str, token_contract: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent token transfers for an account.
        
        Args:
            account_id (str): The account ID
            token_contract (str): Optional specific token contract to filter
            limit (int): Maximum number of transfers to return
            
        Returns:
            List[Dict[str, Any]]: List of transfer data
        """
        try:
            transfers = []
            
            # Get recent transactions
            transactions = self.indexer.get_transactions(account_id, limit=50)
            
            for tx in transactions:
                # Parse transfers from transaction
                parsed_transfers = self._parse_token_transfers(tx, account_id, token_contract)
                transfers.extend(parsed_transfers)
                
                if len(transfers) >= limit:
                    break
            
            return transfers[:limit]
            
        except Exception as e:
            self.logger.error(f"Error fetching transfers for {account_id}: {str(e)}")
            return []
    
    def get_token_info(self, token_symbol_or_contract: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive information about a token.
        
        Args:
            token_symbol_or_contract (str): Token symbol (e.g., 'USDC') or contract ID
            
        Returns:
            Optional[Dict[str, Any]]: Token information
        """
        try:
            # Check if it's a symbol we know
            contract_id = self.token_contracts.get(token_symbol_or_contract.upper(), token_symbol_or_contract)
            
            # Get metadata
            metadata = self.get_token_metadata(contract_id)
            
            if metadata:
                token_info = {
                    "contract_id": contract_id,
                    "symbol": token_symbol_or_contract.upper() if token_symbol_or_contract.upper() in self.token_contracts else metadata.get("symbol"),
                    "metadata": metadata
                }
                
                # Try to get total supply
                try:
                    total_supply = self.indexer.get_contract_state(contract_id, "ft_total_supply", {})
                    if total_supply:
                        token_info["total_supply"] = total_supply
                except Exception:
                    pass
                
                return token_info
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching token info for {token_symbol_or_contract}: {str(e)}")
            return None
    
    def search_tokens(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for tokens by name or symbol.
        
        Args:
            query (str): Search query
            
        Returns:
            List[Dict[str, Any]]: List of matching tokens
        """
        results = []
        query_lower = query.lower()
        
        # Search in known tokens
        for symbol, contract in self.token_contracts.items():
            if query_lower in symbol.lower():
                token_info = self.get_token_info(symbol)
                if token_info:
                    results.append(token_info)
        
        return results
    
    def _parse_token_transfers(self, transaction: Dict[str, Any], account_id: str, filter_contract: str = None) -> List[Dict[str, Any]]:
        """
        Parse token transfers from transaction data.
        
        Args:
            transaction (Dict[str, Any]): Transaction data
            account_id (str): The account ID we're checking for
            filter_contract (str): Optional contract to filter by
            
        Returns:
            List[Dict[str, Any]]: List of parsed transfers
        """
        transfers = []
        
        try:
            # Check transaction actions for function calls
            actions = transaction.get("actions", [])
            
            for action in actions:
                if "FunctionCall" in action:
                    function_call = action["FunctionCall"]
                    method_name = function_call.get("method_name", "")
                    
                    # Look for transfer methods
                    if method_name in ["ft_transfer", "ft_transfer_call"]:
                        receiver_id = transaction.get("receiver_id", "")
                        
                        # Skip if we're filtering by contract and this doesn't match
                        if filter_contract and receiver_id != filter_contract:
                            continue
                        
                        # Parse transfer details
                        transfer = {
                            "transaction_hash": transaction.get("hash"),
                            "timestamp": transaction.get("block_timestamp"),
                            "token_contract": receiver_id,
                            "method": method_name,
                            "signer_id": transaction.get("signer_id"),
                            "receiver_id": receiver_id
                        }
                        
                        # Try to parse amount from args
                        try:
                            args = function_call.get("args", {})
                            if "amount" in args:
                                transfer["amount"] = args["amount"]
                            if "receiver_id" in args:
                                transfer["to"] = args["receiver_id"]
                        except Exception:
                            pass
                        
                        transfers.append(transfer)
        
        except Exception as e:
            self.logger.error(f"Error parsing transfers from transaction: {str(e)}")
        
        return transfers