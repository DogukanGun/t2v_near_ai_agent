"""
DAO Client for accessing DAO voting data on NEAR blockchain.

This module provides functionality to retrieve DAO proposals,
voting information, and governance data.
"""

import logging
from typing import Dict, List, Optional, Any
from .indexer_client import IndexerClient


class DAOClient:
    """
    Client for accessing DAO data on NEAR blockchain.
    
    Provides methods to query DAO proposals, votes, and governance information.
    """
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the DAO client.
        
        Args:
            network (str): The NEAR network ('mainnet' or 'testnet')
        """
        self.network = network
        self.indexer = IndexerClient(network)
        self.logger = logging.getLogger(__name__)
        
        # Known DAO contracts
        self.dao_contracts = {
            "sputnik": "sputnik-dao.near" if network == "mainnet" else "sputnik-dao.testnet",
            "astro": "astro-dao.near" if network == "mainnet" else "astro-dao.testnet"
        }
    
    def get_dao_info(self, dao_id: str) -> Optional[Dict[str, Any]]:
        """
        Get basic DAO information.
        
        Args:
            dao_id (str): The DAO contract account ID
            
        Returns:
            Optional[Dict[str, Any]]: DAO information or None if not found
        """
        try:
            # Get DAO policy and config
            policy = self.indexer.get_contract_state(dao_id, "get_policy", {})
            config = self.indexer.get_contract_state(dao_id, "get_config", {})
            
            if policy or config:
                dao_info = {
                    "dao_id": dao_id,
                    "policy": policy,
                    "config": config
                }
                
                # Get member count if available
                try:
                    members = self.get_dao_members(dao_id)
                    dao_info["member_count"] = len(members) if members else 0
                except Exception:
                    dao_info["member_count"] = 0
                
                return dao_info
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching DAO info for {dao_id}: {str(e)}")
            return None
    
    def get_dao_proposals(self, dao_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent proposals for a DAO.
        
        Args:
            dao_id (str): The DAO contract account ID
            limit (int): Maximum number of proposals to return
            
        Returns:
            List[Dict[str, Any]]: List of proposal data
        """
        try:
            # Get proposals from the DAO contract
            proposals = self.indexer.get_contract_state(
                dao_id,
                "get_proposals",
                {"from_index": 0, "limit": limit}
            )
            
            if proposals:
                # Enrich proposals with additional data
                for proposal in proposals:
                    proposal_id = proposal.get("id")
                    if proposal_id is not None:
                        # Get votes for this proposal
                        votes = self.get_proposal_votes(dao_id, proposal_id)
                        proposal["votes"] = votes
                
                return proposals
            else:
                return []
                
        except Exception as e:
            self.logger.error(f"Error fetching proposals for DAO {dao_id}: {str(e)}")
            return []
    
    def get_proposal_details(self, dao_id: str, proposal_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific proposal.
        
        Args:
            dao_id (str): The DAO contract account ID
            proposal_id (int): The proposal ID
            
        Returns:
            Optional[Dict[str, Any]]: Proposal details or None if not found
        """
        try:
            # Get proposal details
            proposal = self.indexer.get_contract_state(
                dao_id,
                "get_proposal",
                {"id": proposal_id}
            )
            
            if proposal:
                # Get votes for this proposal
                votes = self.get_proposal_votes(dao_id, proposal_id)
                proposal["votes"] = votes
                
                # Calculate vote summary
                proposal["vote_summary"] = self._calculate_vote_summary(votes)
                
                return proposal
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error fetching proposal {proposal_id} for DAO {dao_id}: {str(e)}")
            return None
    
    def get_proposal_votes(self, dao_id: str, proposal_id: int) -> List[Dict[str, Any]]:
        """
        Get votes for a specific proposal.
        
        Args:
            dao_id (str): The DAO contract account ID
            proposal_id (int): The proposal ID
            
        Returns:
            List[Dict[str, Any]]: List of vote data
        """
        try:
            # Note: This method depends on the specific DAO implementation
            # Some DAOs may not have a direct method to get votes
            
            # For Sputnik DAOs, votes are usually part of the proposal data
            proposal = self.indexer.get_contract_state(
                dao_id,
                "get_proposal",
                {"id": proposal_id}
            )
            
            if proposal and "votes" in proposal:
                return proposal["votes"]
            else:
                return []
                
        except Exception as e:
            self.logger.error(f"Error fetching votes for proposal {proposal_id}: {str(e)}")
            return []
    
    def get_dao_members(self, dao_id: str) -> List[str]:
        """
        Get list of DAO members.
        
        Args:
            dao_id (str): The DAO contract account ID
            
        Returns:
            List[str]: List of member account IDs
        """
        try:
            # Get DAO policy which contains member information
            policy = self.indexer.get_contract_state(dao_id, "get_policy", {})
            
            if policy and "roles" in policy:
                members = set()
                for role in policy["roles"]:
                    if "kind" in role and role["kind"].get("Group"):
                        group_members = role["kind"]["Group"]
                        members.update(group_members)
                
                return list(members)
            
            return []
            
        except Exception as e:
            self.logger.error(f"Error fetching members for DAO {dao_id}: {str(e)}")
            return []
    
    def get_user_dao_activity(self, account_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get DAO activity for a specific user.
        
        Args:
            account_id (str): The user account ID
            limit (int): Maximum number of activities to return
            
        Returns:
            List[Dict[str, Any]]: List of DAO activities
        """
        try:
            activities = []
            
            # Get recent transactions for the account
            transactions = self.indexer.get_transactions(account_id, limit=50)
            
            # Filter for DAO-related transactions
            for tx in transactions:
                if self._is_dao_transaction(tx):
                    activity = self._parse_dao_activity(tx)
                    if activity:
                        activities.append(activity)
                
                if len(activities) >= limit:
                    break
            
            return activities
            
        except Exception as e:
            self.logger.error(f"Error fetching DAO activity for {account_id}: {str(e)}")
            return []
    
    def _calculate_vote_summary(self, votes: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Calculate vote summary statistics.
        
        Args:
            votes (List[Dict[str, Any]]): List of votes
            
        Returns:
            Dict[str, int]: Vote summary with counts
        """
        summary = {"approve": 0, "reject": 0, "remove": 0}
        
        for vote in votes:
            vote_type = vote.get("vote", "").lower()
            if vote_type in summary:
                summary[vote_type] += 1
        
        return summary
    
    def _is_dao_transaction(self, transaction: Dict[str, Any]) -> bool:
        """
        Check if a transaction is DAO-related.
        
        Args:
            transaction (Dict[str, Any]): Transaction data
            
        Returns:
            bool: True if DAO-related
        """
        # Check if transaction involves known DAO contracts
        receiver_id = transaction.get("receiver_id", "")
        return any(dao_contract in receiver_id for dao_contract in self.dao_contracts.values())
    
    def _parse_dao_activity(self, transaction: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parse DAO activity from transaction data.
        
        Args:
            transaction (Dict[str, Any]): Transaction data
            
        Returns:
            Optional[Dict[str, Any]]: Parsed activity or None
        """
        try:
            # Extract relevant information from transaction
            activity = {
                "type": "dao_activity",
                "transaction_hash": transaction.get("hash"),
                "timestamp": transaction.get("block_timestamp"),
                "dao_id": transaction.get("receiver_id"),
                "action": "unknown"
            }
            
            # Try to determine the action type from transaction actions
            actions = transaction.get("actions", [])
            for action in actions:
                if "FunctionCall" in action:
                    method_name = action["FunctionCall"].get("method_name", "")
                    if method_name in ["add_proposal", "act_proposal", "vote"]:
                        activity["action"] = method_name
                        break
            
            return activity
            
        except Exception as e:
            self.logger.error(f"Error parsing DAO activity: {str(e)}")
            return None