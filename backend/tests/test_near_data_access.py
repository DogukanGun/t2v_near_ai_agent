"""
Tests for NEAR Data Access functionality.

This test module validates the NEAR data access clients and API endpoints.
"""

import os
import sys
import unittest
from unittest.mock import Mock, patch, MagicMock

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

try:
    from near_data_access import NEARDataClient, IndexerClient, NFTClient, DAOClient, TokenClient
    DATA_ACCESS_AVAILABLE = True
except ImportError:
    DATA_ACCESS_AVAILABLE = False


class TestNEARDataAccess(unittest.TestCase):
    """Test cases for NEAR data access functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        if not DATA_ACCESS_AVAILABLE:
            self.skipTest("NEAR data access not available")
        
        # Mock network requests to avoid actual API calls during testing
        self.mock_requests_patcher = patch('near_data_access.indexer_client.requests')
        self.mock_requests = self.mock_requests_patcher.start()
        
        # Set up mock response
        self.mock_response = Mock()
        self.mock_response.status_code = 200
        self.mock_response.json.return_value = {"test": "data"}
        self.mock_requests.get.return_value = self.mock_response
        self.mock_requests.post.return_value = self.mock_response
        
        # Initialize clients
        self.indexer_client = IndexerClient(network="testnet")
        self.nft_client = NFTClient(network="testnet")
        self.dao_client = DAOClient(network="testnet")
        self.token_client = TokenClient(network="testnet")
        self.data_client = NEARDataClient(network="testnet")
    
    def tearDown(self):
        """Clean up after tests."""
        if hasattr(self, 'mock_requests_patcher'):
            self.mock_requests_patcher.stop()
    
    def test_indexer_client_initialization(self):
        """Test IndexerClient initialization."""
        self.assertEqual(self.indexer_client.network, "testnet")
        self.assertIsNotNone(self.indexer_client.near_lake_endpoint)
        self.assertIsNotNone(self.indexer_client.pagoda_endpoint)
    
    def test_account_info_retrieval(self):
        """Test account information retrieval."""
        # Set up mock response for account info
        self.mock_response.json.return_value = {
            "account_id": "test.testnet",
            "amount": "1000000000000000000000000",  # 1 NEAR in yoctoNEAR
            "code_hash": "11111111111111111111111111111111"
        }
        
        result = self.indexer_client.get_account_info("test.testnet")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["account_id"], "test.testnet")
        self.mock_requests.get.assert_called()
    
    def test_token_balance_retrieval(self):
        """Test token balance retrieval."""
        # Test NEAR balance
        self.mock_response.json.return_value = {
            "amount": "5000000000000000000000000",  # 5 NEAR
            "account_id": "test.testnet"
        }
        
        result = self.token_client.get_token_balance("test.testnet", "near")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["account_id"], "test.testnet")
        self.assertEqual(result["symbol"], "NEAR")
    
    def test_nft_collection_info(self):
        """Test NFT collection information retrieval."""
        # Mock NFT metadata response
        self.mock_response.json.return_value = {
            "name": "Test NFT Collection",
            "symbol": "TNFT",
            "base_uri": "https://example.com/metadata/"
        }
        
        result = self.nft_client.get_nft_collection_info("test-nft.testnet")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["contract_id"], "test-nft.testnet")
    
    def test_dao_info_retrieval(self):
        """Test DAO information retrieval."""
        # Mock DAO policy response
        self.mock_response.json.return_value = {
            "roles": [
                {"kind": {"Group": ["member1.testnet", "member2.testnet"]}}
            ],
            "default_vote_policy": {}
        }
        
        result = self.dao_client.get_dao_info("test-dao.testnet")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["dao_id"], "test-dao.testnet")
    
    def test_unified_data_client(self):
        """Test the unified NEARDataClient."""
        # Mock account overview response
        self.mock_response.json.return_value = {
            "account_id": "test.testnet",
            "amount": "1000000000000000000000000"
        }
        
        result = self.data_client.get_account_overview("test.testnet")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["account_id"], "test.testnet")
        self.assertEqual(result["network"], "testnet")
    
    def test_search_and_analyze(self):
        """Test the search and analyze functionality."""
        result = self.data_client.search_and_analyze("test.testnet", "account")
        
        self.assertIsNotNone(result)
        self.assertEqual(result["query"], "test.testnet")
        self.assertEqual(result["search_type"], "account")
    
    def test_network_stats(self):
        """Test network statistics retrieval."""
        result = self.data_client.get_network_stats()
        
        self.assertIsNotNone(result)
        self.assertEqual(result["network"], "testnet")
        self.assertIn("supported_features", result)
        self.assertIn("known_tokens", result)
    
    def test_error_handling(self):
        """Test error handling in data access methods."""
        # Mock a failed request
        self.mock_response.status_code = 404
        
        result = self.indexer_client.get_account_info("nonexistent.testnet")
        
        self.assertIsNone(result)
    
    def test_token_search(self):
        """Test token search functionality."""
        result = self.token_client.search_tokens("USDC")
        
        # Should return results even with mocked data
        self.assertIsInstance(result, list)


class TestAPIEndpoints(unittest.TestCase):
    """Test cases for API endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Import FastAPI test client
        try:
            from fastapi.testclient import TestClient
            import main
            self.client = TestClient(main.app)
            self.api_available = True
        except ImportError:
            self.api_available = False
    
    def test_health_endpoints(self):
        """Test health check endpoints."""
        if not self.api_available:
            self.skipTest("FastAPI not available")
        
        # Test root endpoint
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())
        
        # Test health endpoint
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())
    
    def test_environment_endpoint(self):
        """Test environment information endpoint."""
        if not self.api_available:
            self.skipTest("FastAPI not available")
        
        response = self.client.get("/api/environment")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("python_version", data)
        self.assertIn("near_data_access_available", data)
    
    @patch('main.near_data_client')
    def test_account_info_endpoint(self, mock_client):
        """Test account info API endpoint."""
        if not self.api_available:
            self.skipTest("FastAPI not available")
        
        # Mock the data client
        mock_client.get_account_overview.return_value = {
            "account_id": "test.testnet",
            "network": "testnet",
            "token_balances": []
        }
        
        response = self.client.post("/api/near/account-info", json={
            "account_id": "test.testnet"
        })
        
        if response.status_code == 503:
            # NEAR data access not available
            self.skipTest("NEAR data access not available in test environment")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["account_id"], "test.testnet")


if __name__ == "__main__":
    # Run the tests
    unittest.main(verbosity=2)