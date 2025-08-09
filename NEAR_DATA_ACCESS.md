# NEAR Data Access Integration

This documentation describes the NEAR data access capabilities added to the T2V Near AI Agent. The integration allows the agent to retrieve on-chain data including NFT information, DAO voting data, and token balances using NEAR indexers.

## Overview

The NEAR data access integration consists of several components:

- **IndexerClient**: Interfaces with NEAR Lake and Pagoda indexers for basic blockchain data
- **NFTClient**: Retrieves NFT metadata, ownership, and collection information
- **DAOClient**: Accesses DAO proposals, voting data, and governance information
- **TokenClient**: Queries token balances, metadata, and transfer history
- **NEARDataClient**: Unified interface combining all data access capabilities

## Installation & Setup

The data access module is located in `backend/near_data_access/` and requires the following Python packages:

```bash
pip install requests
```

## Usage

### Basic Usage

```python
from near_data_access import NEARDataClient

# Initialize client for mainnet or testnet
client = NEARDataClient(network="mainnet")

# Get comprehensive account overview
overview = client.get_account_overview("example.near")
print(f"Account: {overview['account_id']}")
print(f"NEAR Balance: {overview['account_info']['amount']}")
print(f"Token Count: {len(overview['token_balances'])}")
print(f"NFT Count: {overview['nft_count']}")
```

### Token Balance Queries

```python
# Get all token balances for an account
balances = client.token.get_all_token_balances("example.near")

# Get balance for a specific token
usdc_balance = client.token.get_token_balance("example.near", "USDC")

# Get token metadata
token_info = client.token.get_token_info("USDC")
```

### NFT Information

```python
# Get NFTs owned by an account
nfts = client.nft.get_nfts_by_owner("example.near", limit=10)

# Get specific NFT information
nft = client.nft.get_nft_by_token_id("x.paras.near", "12345")

# Get NFT collection information
collection = client.nft.get_nft_collection_info("x.paras.near")
```

### DAO Data

```python
# Get DAO information
dao_info = client.dao.get_dao_info("example-dao.near")

# Get DAO proposals
proposals = client.dao.get_dao_proposals("example-dao.near", limit=10)

# Get specific proposal details
proposal = client.dao.get_proposal_details("example-dao.near", 123)
```

### General Queries

```python
# Search and analyze blockchain data
result = client.search_and_analyze("example.near", "account")
result = client.search_and_analyze("USDC", "token")
result = client.search_and_analyze("dao", "multi")
```

## AI Agent Integration

The existing AI agent (`AIAgent` class) has been extended with new data access methods:

```python
from near_intent.near_intents.ai_agent import AIAgent

# Initialize agent (requires NEAR account file)
agent = AIAgent("account.json", network="mainnet")

# Get account information
account_info = agent.get_account_info("example.near")

# Get token balances
balances = agent.get_token_balances("example.near")

# Get NFT information
nfts = agent.get_nft_info(owner_id="example.near")

# Get DAO information
dao_info = agent.get_dao_info("example-dao.near", proposals=True)

# General blockchain queries
data = agent.query_blockchain_data("example.near", "account")
```

## API Endpoints

The FastAPI backend now includes new endpoints for NEAR data access:

### Account Information
- **POST** `/api/near/account-info`
- Get comprehensive account overview including balances, NFTs, and DAO activity

```json
{
  "account_id": "example.near",
  "include_balances": true,
  "include_nfts": true,
  "include_dao_activity": true
}
```

### Token Balances
- **POST** `/api/near/token-balances`
- Get token balances for an account

```json
{
  "account_id": "example.near",
  "token_contract": "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near"
}
```

### NFT Information
- **POST** `/api/near/nft-info`
- Get NFT information by token or owner

```json
{
  "contract_id": "x.paras.near",
  "token_id": "12345",
  "owner_id": "example.near"
}
```

### DAO Information
- **POST** `/api/near/dao-info`
- Get DAO information and proposals

```json
{
  "dao_id": "example-dao.near",
  "include_proposals": true
}
```

### General Query
- **POST** `/api/near/query`
- General purpose blockchain data query

```json
{
  "query": "example.near",
  "search_type": "account"
}
```

### Network Statistics
- **GET** `/api/near/network-stats`
- Get network statistics and supported features

## Configuration

The system can be configured using environment variables:

- `NEAR_NETWORK`: Network to use (`mainnet` or `testnet`) - default: `mainnet`
- `DEMO_ACCOUNT`: Account to use for demonstrations - default: `test.testnet`

## Supported Indexers

The integration currently supports:

### NEAR Lake Indexer
- Account information
- Transaction history
- Contract state queries
- Used as primary data source

### Pagoda Indexer
- Advanced analytics
- Enhanced data formatting
- Used for enhanced features

### External APIs
- **Paras**: NFT marketplace data
- **Mintbase**: NFT collections and metadata

## Error Handling

The system includes comprehensive error handling:

- Network timeouts and connection errors
- Invalid account IDs or contract addresses
- Missing or unavailable data
- Rate limiting and API failures

All errors are logged with appropriate detail levels and user-friendly error messages are returned.

## Testing

Run the test suite:

```bash
# Unit tests with mocked network calls
python tests/test_near_data_access.py

# Integration test suite
python test_integration.py

# Demonstration script
python examples/near_data_demo.py
```

## Examples

See `backend/examples/near_data_demo.py` for a comprehensive demonstration of all features.

## Limitations

- Network access required for live data (APIs are mocked in test environment)
- Some external APIs (Paras, Mintbase) may have rate limits
- Historical data availability depends on indexer retention policies
- Testnet data may be limited compared to mainnet

## Future Enhancements

Potential areas for expansion:

1. **Additional Indexers**: Support for more NEAR indexers and APIs
2. **Caching**: Add Redis or in-memory caching for frequently accessed data
3. **Real-time Updates**: WebSocket connections for live data updates
4. **Enhanced Analytics**: More sophisticated data analysis and aggregation
5. **Cross-chain Data**: Integration with other blockchain indexers