"""
NFT Client for accessing NFT data on NEAR blockchain.

This module provides functionality to retrieve NFT information,
metadata, and ownership details.
"""

import logging
from typing import Dict, List, Optional, Any
import requests
from .indexer_client import IndexerClient


class NFTClient:
    """
    Client for accessing NFT data on NEAR blockchain.
    
    Provides methods to query NFT collections, tokens, and metadata.
    """
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the NFT client.
        
        Args:
            network (str): The NEAR network ('mainnet' or 'testnet')
        """
        self.network = network
        self.indexer = IndexerClient(network)
        self.logger = logging.getLogger(__name__)
        
        # Known NFT marketplaces and indexers
        self.nft_endpoints = {
            "paras": "https://api-v2-mainnet.paras.id" if network == "mainnet" else "https://api-v2-testnet.paras.id",
            "mintbase": "https://graph.mintbase.xyz" if network == "mainnet" else "https://testnet.graph.mintbase.xyz"
        }
    
    def get_nft_by_token_id(self, contract_id: str, token_id: str) -> Optional[Dict[str, Any]]:
        """
        Get NFT information by contract and token ID.
        
        Args:
            contract_id (str): The NFT contract account ID
            token_id (str): The token ID
            
        Returns:
            Optional[Dict[str, Any]]: NFT data or None if not found
        """
        try:
            # First try to get basic NFT info from contract
            nft_info = self.indexer.get_contract_state(
                contract_id, 
                "nft_token", 
                {"token_id": token_id}
            )
            
            if nft_info:
                # Try to get additional metadata if available
                metadata = self._get_nft_metadata(contract_id, token_id)
                if metadata:
                    nft_info["enhanced_metadata"] = metadata
                
                return nft_info
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching NFT {contract_id}:{token_id}: {str(e)}")
            return None
    
    def get_nfts_by_owner(self, owner_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get NFTs owned by a specific account.
        
        Args:
            owner_id (str): The owner account ID
            limit (int): Maximum number of NFTs to return
            
        Returns:
            List[Dict[str, Any]]: List of NFT data
        """
        try:
            nfts = []
            
            # Try Paras API for popular NFTs
            try:
                paras_nfts = self._get_paras_nfts_by_owner(owner_id, limit)
                nfts.extend(paras_nfts)
            except Exception as e:
                self.logger.warning(f"Paras API unavailable: {str(e)}")
            
            # If we don't have enough results, try other methods
            if len(nfts) < limit:
                # Try to get NFTs from known contracts
                known_contracts = [
                    "x.paras.near",
                    "asac.near",
                    "nft.nearapac.near"
                ]
                
                for contract in known_contracts:
                    try:
                        contract_nfts = self._get_nfts_from_contract(contract, owner_id)
                        nfts.extend(contract_nfts)
                        if len(nfts) >= limit:
                            break
                    except Exception as e:
                        self.logger.warning(f"Error querying contract {contract}: {str(e)}")
            
            return nfts[:limit]
            
        except Exception as e:
            self.logger.error(f"Error fetching NFTs for owner {owner_id}: {str(e)}")
            return []
    
    def get_nft_collection_info(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """
        Get information about an NFT collection.
        
        Args:
            contract_id (str): The NFT contract account ID
            
        Returns:
            Optional[Dict[str, Any]]: Collection information
        """
        try:
            # Get collection metadata
            metadata = self.indexer.get_contract_state(contract_id, "nft_metadata", {})
            
            if metadata:
                # Get additional stats
                total_supply = self.indexer.get_contract_state(contract_id, "nft_total_supply", {})
                
                collection_info = {
                    "contract_id": contract_id,
                    "metadata": metadata,
                    "total_supply": total_supply
                }
                
                return collection_info
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching collection info for {contract_id}: {str(e)}")
            return None
    
    def _get_nft_metadata(self, contract_id: str, token_id: str) -> Optional[Dict[str, Any]]:
        """
        Get enhanced metadata for an NFT.
        
        Args:
            contract_id (str): The NFT contract account ID
            token_id (str): The token ID
            
        Returns:
            Optional[Dict[str, Any]]: Enhanced metadata
        """
        try:
            # This is a placeholder for enhanced metadata retrieval
            # In a real implementation, this would call external APIs or IPFS
            return {"source": "placeholder", "enhanced": True}
            
        except Exception as e:
            self.logger.error(f"Error fetching metadata: {str(e)}")
            return None
    
    def _get_paras_nfts_by_owner(self, owner_id: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get NFTs from Paras marketplace API.
        
        Args:
            owner_id (str): The owner account ID
            limit (int): Maximum number of NFTs to return
            
        Returns:
            List[Dict[str, Any]]: List of NFT data from Paras
        """
        try:
            url = f"{self.nft_endpoints['paras']}/tokens"
            params = {
                "owner_id": owner_id,
                "__limit": limit
            }
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            else:
                self.logger.warning(f"Paras API returned {response.status_code}")
                return []
                
        except requests.RequestException as e:
            self.logger.error(f"Paras API request failed: {str(e)}")
            return []
    
    def _get_nfts_from_contract(self, contract_id: str, owner_id: str) -> List[Dict[str, Any]]:
        """
        Get NFTs from a specific contract for an owner.
        
        Args:
            contract_id (str): The NFT contract account ID
            owner_id (str): The owner account ID
            
        Returns:
            List[Dict[str, Any]]: List of NFT data
        """
        try:
            # Try to get tokens for owner from the contract
            tokens = self.indexer.get_contract_state(
                contract_id,
                "nft_tokens_for_owner",
                {"account_id": owner_id, "limit": 10}
            )
            
            if tokens:
                return tokens
            else:
                return []
                
        except Exception as e:
            self.logger.error(f"Error querying contract {contract_id}: {str(e)}")
            return []