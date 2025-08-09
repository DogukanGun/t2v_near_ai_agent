#!/usr/bin/env python3
"""
Example script demonstrating NEAR data access capabilities.

This script shows how to use the new NEAR data access functionality
to retrieve on-chain data including NFTs, DAO voting, and token balances.
"""

import os
import sys
import logging
from typing import Dict, Any

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

try:
    from near_data_access import NEARDataClient
    DATA_ACCESS_AVAILABLE = True
except ImportError:
    print("NEAR data access module not available. Please check installation.")
    DATA_ACCESS_AVAILABLE = False
    sys.exit(1)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def demonstrate_account_overview(client: NEARDataClient, account_id: str):
    """Demonstrate getting a comprehensive account overview."""
    print(f"\n=== Account Overview for {account_id} ===")
    
    try:
        overview = client.get_account_overview(account_id)
        
        print(f"Account ID: {overview.get('account_id')}")
        print(f"Network: {overview.get('network')}")
        
        # Display account info
        account_info = overview.get('account_info', {})
        if account_info:
            balance_yocto = account_info.get('amount', '0')
            balance_near = float(balance_yocto) / 10**24 if balance_yocto != '0' else 0
            print(f"NEAR Balance: {balance_near:.4f} NEAR")
        
        # Display token balances
        token_balances = overview.get('token_balances', [])
        print(f"\nToken Balances ({len(token_balances)} tokens):")
        for token in token_balances[:5]:  # Show first 5
            symbol = token.get('symbol', 'UNKNOWN')
            balance = token.get('balance_formatted', '0')
            print(f"  {symbol}: {balance}")
        
        # Display NFT count
        nft_count = overview.get('nft_count', 0)
        print(f"\nNFTs Owned: {nft_count}")
        
        # Display recent DAO activity
        dao_activity = overview.get('dao_activity', [])
        print(f"Recent DAO Activities: {len(dao_activity)}")
        
    except Exception as e:
        print(f"Error getting account overview: {str(e)}")


def demonstrate_token_queries(client: NEARDataClient):
    """Demonstrate token-related queries."""
    print(f"\n=== Token Information ===")
    
    # Get info for known tokens
    tokens_to_check = ["USDC", "NEAR", "REF"]
    
    for token_symbol in tokens_to_check:
        try:
            token_info = client.token.get_token_info(token_symbol)
            if token_info:
                print(f"\n{token_symbol}:")
                print(f"  Contract: {token_info.get('contract_id')}")
                metadata = token_info.get('metadata', {})
                if metadata:
                    print(f"  Name: {metadata.get('name', 'N/A')}")
                    print(f"  Decimals: {metadata.get('decimals', 'N/A')}")
        except Exception as e:
            print(f"Error getting {token_symbol} info: {str(e)}")


def demonstrate_nft_queries(client: NEARDataClient, account_id: str):
    """Demonstrate NFT-related queries."""
    print(f"\n=== NFT Information ===")
    
    try:
        # Get NFTs owned by account
        nfts = client.nft.get_nfts_by_owner(account_id, limit=3)
        print(f"NFTs owned by {account_id}: {len(nfts)}")
        
        for i, nft in enumerate(nfts):
            print(f"  NFT {i+1}: {nft}")
        
        # Try to get info about a known NFT collection
        known_collections = ["x.paras.near", "asac.near"]
        for collection in known_collections:
            try:
                collection_info = client.nft.get_nft_collection_info(collection)
                if collection_info:
                    print(f"\nCollection {collection}:")
                    metadata = collection_info.get('metadata', {})
                    if metadata:
                        print(f"  Name: {metadata.get('name', 'N/A')}")
                        print(f"  Symbol: {metadata.get('symbol', 'N/A')}")
                    total_supply = collection_info.get('total_supply')
                    if total_supply:
                        print(f"  Total Supply: {total_supply}")
                    break  # Stop after first successful query
            except Exception as e:
                logger.debug(f"Error querying collection {collection}: {str(e)}")
                continue
    
    except Exception as e:
        print(f"Error getting NFT information: {str(e)}")


def demonstrate_dao_queries(client: NEARDataClient):
    """Demonstrate DAO-related queries."""
    print(f"\n=== DAO Information ===")
    
    # Try to get info about known DAOs
    known_daos = ["sputnik-dao.near", "astro-dao.near"]
    
    for dao_id in known_daos:
        try:
            dao_info = client.dao.get_dao_info(dao_id)
            if dao_info:
                print(f"\nDAO: {dao_id}")
                print(f"  Member Count: {dao_info.get('member_count', 'N/A')}")
                
                # Get recent proposals
                proposals = client.dao.get_dao_proposals(dao_id, limit=2)
                print(f"  Recent Proposals: {len(proposals)}")
                
                for i, proposal in enumerate(proposals):
                    proposal_id = proposal.get('id', 'N/A')
                    description = proposal.get('description', 'N/A')
                    print(f"    Proposal {proposal_id}: {description[:50]}...")
                
                break  # Stop after first successful query
        except Exception as e:
            logger.debug(f"Error querying DAO {dao_id}: {str(e)}")
            continue


def demonstrate_search_functionality(client: NEARDataClient):
    """Demonstrate search and analysis functionality."""
    print(f"\n=== Search and Analysis ===")
    
    queries = [
        ("near", "token"),
        ("dao", "multi"),
        ("usdc", "token")
    ]
    
    for query, search_type in queries:
        try:
            result = client.search_and_analyze(query, search_type)
            print(f"\nSearch for '{query}' (type: {search_type}):")
            print(f"  Results found: {list(result.get('results', {}).keys())}")
        except Exception as e:
            print(f"Error in search for '{query}': {str(e)}")


def main():
    """Main demonstration function."""
    print("=== NEAR Data Access Demonstration ===")
    
    if not DATA_ACCESS_AVAILABLE:
        print("NEAR data access not available. Exiting.")
        return
    
    # Initialize the client (using testnet for demonstration)
    network = os.getenv("NEAR_NETWORK", "testnet")
    print(f"Using network: {network}")
    
    try:
        client = NEARDataClient(network=network)
        print("NEAR data client initialized successfully")
    except Exception as e:
        print(f"Failed to initialize NEAR data client: {str(e)}")
        return
    
    # Get network stats
    try:
        stats = client.get_network_stats()
        print(f"\nNetwork Stats:")
        print(f"  Supported features: {stats.get('supported_features', [])}")
        print(f"  Known tokens: {stats.get('known_tokens', [])}")
    except Exception as e:
        print(f"Error getting network stats: {str(e)}")
    
    # Example account to demonstrate with
    demo_account = os.getenv("DEMO_ACCOUNT", "test.testnet")
    print(f"\nUsing demo account: {demo_account}")
    
    # Run demonstrations
    demonstrate_account_overview(client, demo_account)
    demonstrate_token_queries(client)
    demonstrate_nft_queries(client, demo_account)
    demonstrate_dao_queries(client)
    demonstrate_search_functionality(client)
    
    print(f"\n=== Demonstration Complete ===")
    print("This demonstrates the NEAR data access capabilities added to the T2V AI Agent.")
    print("The agent can now retrieve on-chain data including:")
    print("- Account information and token balances")
    print("- NFT ownership and metadata")
    print("- DAO proposals and voting information") 
    print("- General blockchain data queries")


if __name__ == "__main__":
    main()