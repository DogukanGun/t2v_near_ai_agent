"""
Pseudocode & Detailed Explanation for AI Agent NEAR-to-Token Swap Implementation:

1. Overview:
   - The AI Agent is designed to automate intent execution on the NEAR mainnet.
   - It loads an NEAR account using a local key file,registers its public key for intent operations
     and then performs token operations such as depositing NEAR (if necessary) 
     and swapping NEAR for another token.
   - The swap process leverages the following workflow:
     a. Build an IntentRequest detailing the input (NEAR) and desired output token.
     b. Query the Solver Bus API to obtain available trading options.
     c. Select the best option based on the criteria (e.g., minimal outgoing amount).
     d. Generate a signed quote using our raw ED25519 signer.
     e. Publish the signed intent to the Solver Bus and return the response.

2. Implementation Steps:
   - Import required functions from intents.py:
       • account: Load an account object from a given file.
       • register_intent_public_key: Register the account's public key with the intents contract.
       • intent_deposit: Send a deposit call for NEAR to be eligible for intent operations.
       • intent_swap: Execute a swap intent by utilizing the intent API.
   - Create the AIAgent class:
       • __init__: Initialize the agent by loading the account and
        ensuring that its public key is registered.
       • deposit_near: (Optional) Ensure that the account has deposited enough NEAR
        to cover intent deposits.
       • swap_near_to_token: Call the intent_swap function to execute a swap from NEAR
        to another token.
   - Add robust logging for step-by-step tracing and error handling.
   - Provide an example usage in the main block to demonstrate:
       • Instantiating the AIAgent with an account file.
       • Depositing NEAR.
       • Executing a swap from NEAR to a target token (e.g., USDC).

3. Benefits:
   - This design encapsulates NEAR intent execution within an easy-to-use class.
   - Detailed in-line pseudocode and logging boost maintainability and debuggability.
   - Follows best practices such as separation of concerns 
    while reusing shared components defined in intents.py.

Note:
   - This implementation is aligned with the NEAR Defuse Protocol on mainnet, 
    which describes the use of a solver bus for quoting 
    and executing token diff intents. For further details, see:
    https://docs.near-intents.org/defuse-protocol
"""

import logging
import os
import sys

from dotenv import load_dotenv
from near_intents import (ASSET_MAP, IntentRequest, account, fetch_options,
                          intent_deposit, intent_swap,
                          register_intent_public_key, register_token_storage,
                          select_best_option)

# Add the parent directory to sys.path so that 'near_intents' can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add the backend directory to sys.path for near_data_access imports
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "near_data_access")
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from near_data_access import NEARDataClient
except ImportError:
    # Fallback if import fails
    NEARDataClient = None

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


class AIAgent:
    """
    AIAgent is responsible for executing NEAR intents on mainnet.

    Primary responsibilities include:
    - Loading the NEAR account.
    - Registering the public key for intent operations.
    - Optionally ensuring that a NEAR deposit has been made.
    - Executing token swap intents through the Solver Bus using provided functions.
    - Processing AI messages and triggering automatic payments.
    """

    def __init__(self, account_file: str, ai_provider: str = "openai", network: str = "mainnet"):
        """
        Initialize the agent by:
        1. Loading the account from the given account file.
        2. Registering the account's public key with the intents contract.
        3. Setting up AI provider for message processing.
        4. Initializing NEAR data access capabilities.
        """
        if not os.path.exists(account_file):
            raise FileNotFoundError(
                f"Account file not found at {account_file}. "
                "Please ensure the file exists and the path is correct."
            )

        logging.info("Loading account from file: %s", account_file)
        self.account = account(account_file)
        self.network = network

        # Initialize NEAR data access client if available
        self.data_client = None
        if NEARDataClient:
            try:
                self.data_client = NEARDataClient(network)
                logging.info("NEAR data access client initialized successfully")
            except Exception as e:
                logging.warning(f"Failed to initialize data client: {str(e)}")
        else:
            logging.warning("NEAR data access not available - install near_data_access module")

        # Check if the account exists and has sufficient balance
        try:
            account_state = self.account.state()
            if not account_state:
                raise ValueError(
                    f"Account {self.account.account_id} not found or not accessible"
                )

            balance_near = (
                float(account_state["amount"]) / 10**24
            )  # Convert yoctoNEAR to NEAR
            logging.info("Account state: Balance %.4f NEAR", balance_near)

            if balance_near < 0.1:  # Minimum balance check
                raise ValueError(
                    f"Insufficient balance ({balance_near} NEAR). Minimum required: 0.1 NEAR"
                )

        except (ValueError, KeyError, TypeError) as e:
            logging.error("Error checking account state: %s", e)
            raise

        logging.info(
            "Registering intent public key for account: %s", self.account.account_id
        )
        try:
            register_intent_public_key(self.account)
            logging.info(
                "Public key registered successfully with intents.near contract"
            )
        except (ValueError, RuntimeError, OSError) as e:
            error_str = str(e)
            if "public key already exists" in error_str:
                logging.info("Public key already registered with intents.near contract")
            elif "already registered" in error_str.lower():
                logging.info("Public key already registered with intents.near contract")
            else:
                logging.error("Failed to register public key: %s", e)
                raise

    def deposit_near(self, amount: float) -> None:
        """
        Deposits the specified amount of NEAR tokens to ensure the account can participate
        in intent operations such as swaps.

        Args:
            amount (float): Amount of NEAR to deposit.
        """
        if amount <= 0:
            raise ValueError("Deposit amount must be greater than 0")

        token = "NEAR"
        logging.info("Depositing %.4f NEAR for intent operations", amount)
        try:
            # Check current balance before deposit
            account_state = self.account.state()
            if not account_state:
                raise ValueError(
                    f"Account {self.account.account_id} not found or not accessible"
                )

            balance_near = float(account_state["amount"]) / 10**24

            if balance_near < amount:
                raise ValueError(
                    f"Insufficient balance ({balance_near:.4f} NEAR) "
                    f"for deposit of {amount:.4f} NEAR"
                )

            # First register storage if needed
            try:
                register_token_storage(
                    self.account, token, other_account="intents.near"
                )
                logging.info("Storage registered for NEAR token")
            except (ValueError, RuntimeError, OSError) as e:
                if "already registered" not in str(e).lower():
                    raise
                logging.info("Storage already registered for NEAR token")

            # Then deposit NEAR using the provided amount
            intent_deposit(self.account, token, float(amount))  # Ensure amount is float
            logging.info("Deposit transaction submitted successfully")
        except (ValueError, KeyError, TypeError) as e:
            logging.error("Failed to deposit NEAR: %s", e)
            raise

    def swap_near_to_token(self, target_token: str, amount_in: float):
        """
        Executes a swap intent from NEAR to the specified target token.

        Steps:
        1. Log the initiation of the swap process.
        2. Call the intent_swap function from intents.py with parameters:
           - token_in as NEAR.
           - amount_in as the desired NEAR amount to swap.
           - token_out as the target token.
        3. Return the response received from the Solver Bus.

        Args:
            target_token (str): The token symbol to swap to (e.g., 'USDC').
            amount_in (float): The amount of NEAR to be swapped.

        Returns:
            dict: The response from the intent swap call, which may include status and any errors.
        """
        if amount_in <= 0:
            raise ValueError("Swap amount must be greater than 0")

        if target_token not in ASSET_MAP:
            raise ValueError(
                f"Unsupported target token: {target_token}. "
                f"Supported tokens: {list(ASSET_MAP.keys())}"
            )

        logging.info("Initiating swap: %s NEAR -> %s", amount_in, target_token)
        try:
            # Check current balance before swap
            account_state = self.account.state()
            if not account_state:
                raise ValueError(
                    f"Account {self.account.account_id} not found or not accessible"
                )

            balance_near = float(account_state["amount"]) / 10**24

            if balance_near < amount_in:
                raise ValueError(
                    f"Insufficient balance ({balance_near} NEAR) "
                    f"for swap of {amount_in} NEAR"
                )

            # Create intent request and fetch options
            request = (
                IntentRequest()
                .set_asset_in("NEAR", amount_in)
                .set_asset_out(target_token)
            )
            options = fetch_options(request)

            if not options:
                raise ValueError(
                    "No swap options available. Try again later or with a different amount."
                )

            logging.info("Found %d swap options", len(options))
            best_option = select_best_option(options)
            logging.info("Selected best option: %s", best_option)

            # Execute the swap
            response = intent_swap(self.account, "NEAR", amount_in, target_token)
            logging.info("Swap request submitted successfully")
            logging.debug("Swap response: %s", response)
            return response
        except (ValueError, KeyError, TypeError) as e:
            logging.error("Failed to execute swap: %s", e)
            raise

    # NEAR Data Access Methods
    
    def get_account_info(self, account_id: str = None) -> dict:
        """
        Get account information for the specified account or self.
        
        Args:
            account_id (str): Account ID to query, defaults to self
            
        Returns:
            dict: Account information
        """
        if not self.data_client:
            raise RuntimeError("Data client not available")
        
        target_account = account_id or self.account.account_id
        logging.info(f"Getting account info for: {target_account}")
        
        try:
            return self.data_client.get_account_overview(target_account)
        except Exception as e:
            logging.error(f"Failed to get account info: {str(e)}")
            raise

    def get_token_balances(self, account_id: str = None) -> list:
        """
        Get token balances for the specified account or self.
        
        Args:
            account_id (str): Account ID to query, defaults to self
            
        Returns:
            list: List of token balances
        """
        if not self.data_client:
            raise RuntimeError("Data client not available")
        
        target_account = account_id or self.account.account_id
        logging.info(f"Getting token balances for: {target_account}")
        
        try:
            return self.data_client.token.get_all_token_balances(target_account)
        except Exception as e:
            logging.error(f"Failed to get token balances: {str(e)}")
            raise

    def get_nft_info(self, contract_id: str = None, token_id: str = None, owner_id: str = None) -> dict:
        """
        Get NFT information either by specific token or by owner.
        
        Args:
            contract_id (str): NFT contract ID
            token_id (str): Specific token ID  
            owner_id (str): Owner account ID to get all NFTs
            
        Returns:
            dict: NFT information
        """
        if not self.data_client:
            raise RuntimeError("Data client not available")
        
        try:
            if contract_id and token_id:
                logging.info(f"Getting NFT info for: {contract_id}:{token_id}")
                return self.data_client.nft.get_nft_by_token_id(contract_id, token_id)
            elif owner_id:
                logging.info(f"Getting NFTs for owner: {owner_id}")
                return self.data_client.nft.get_nfts_by_owner(owner_id)
            else:
                # Default to getting NFTs for self
                target_account = self.account.account_id
                logging.info(f"Getting NFTs for self: {target_account}")
                return self.data_client.nft.get_nfts_by_owner(target_account)
        except Exception as e:
            logging.error(f"Failed to get NFT info: {str(e)}")
            raise

    def get_dao_info(self, dao_id: str = None, proposals: bool = False) -> dict:
        """
        Get DAO information and optionally proposals.
        
        Args:
            dao_id (str): DAO contract ID
            proposals (bool): Whether to include recent proposals
            
        Returns:
            dict: DAO information
        """
        if not self.data_client:
            raise RuntimeError("Data client not available")
        
        if not dao_id:
            raise ValueError("DAO ID is required")
        
        logging.info(f"Getting DAO info for: {dao_id}")
        
        try:
            dao_info = self.data_client.dao.get_dao_info(dao_id)
            
            if proposals and dao_info:
                dao_proposals = self.data_client.dao.get_dao_proposals(dao_id, limit=5)
                dao_info["recent_proposals"] = dao_proposals
            
            return dao_info
        except Exception as e:
            logging.error(f"Failed to get DAO info: {str(e)}")
            raise

    def query_blockchain_data(self, query: str, search_type: str = "auto") -> dict:
        """
        General purpose blockchain data query method.
        
        Args:
            query (str): Search query (account, token, DAO, etc.)
            search_type (str): Type of search to perform
            
        Returns:
            dict: Query results
        """
        if not self.data_client:
            raise RuntimeError("Data client not available")
        
        logging.info(f"Querying blockchain data: {query} (type: {search_type})")
        
        try:
            return self.data_client.search_and_analyze(query, search_type)
        except Exception as e:
            logging.error(f"Failed to query blockchain data: {str(e)}")
            raise


def handle_intent_execution(intent_type, *args, **kwargs):
    """Handle intent execution with proper error handling."""
    try:
        # Remove unused ai_provider parameter from kwargs if present
        kwargs.pop('ai_provider', None)
        
        if intent_type == "swap":
            return intent_swap(*args, **kwargs)
        # Add other intent types as needed
        return None
    except Exception as e:
        logging.error(f"Error executing {intent_type} intent: {str(e)}")
        raise


def main():
    """
    Example execution:
    1. Initialize logging.
    2. Load an account from the specified file.
    3. Deposit NEAR (if necessary) to set up for intent operations.
    4. Execute a swap from NEAR to a desired token (e.g., USDC) and log the outcome.
    """
    # Load environment variables first
    load_dotenv(override=True)  # Add override=True to ensure variables are loaded

    # Get account file path and parameters from environment
    account_path = os.getenv("NEAR_ACCOUNT_FILE", "./account_file.json")

    # Get and validate deposit amount
    try:
        deposit_amount = float(os.getenv("NEAR_DEPOSIT_AMOUNT", "0.01"))
        if deposit_amount <= 0:
            raise ValueError("NEAR_DEPOSIT_AMOUNT must be greater than 0")
    except ValueError as e:
        logging.error("Invalid NEAR_DEPOSIT_AMOUNT: %s", str(e))
        sys.exit(1)

    # Get other parameters
    target_token = os.getenv("TARGET_TOKEN", "USDC")
    swap_amount = float(os.getenv("SWAP_AMOUNT", "0.01"))

    logging.info(
        "Configuration loaded - Deposit: %.4f NEAR, Target: %s, Swap: %.4f NEAR",
        deposit_amount,
        target_token,
        swap_amount,
    )

    try:
        # Initialize the AI Agent
        agent = AIAgent(account_path)

        # Deposit NEAR if needed
        logging.info("Submitting a deposit of %.4f NEAR", deposit_amount)
        agent.deposit_near(deposit_amount)

        # Execute the swap
        logging.info(
            "Starting token swap of %.4f NEAR to %s", swap_amount, target_token
        )
        result = agent.swap_near_to_token(target_token, swap_amount)
        logging.info("Token swap completed. Result: %s", result)

    except FileNotFoundError as e:
        logging.error("Account file error: %s", str(e))
        sys.exit(1)
    except ValueError as e:
        logging.error("Value error: %s", str(e))
        sys.exit(1)
    except (RuntimeError, OSError) as e:
        logging.error("System error: %s", str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()
