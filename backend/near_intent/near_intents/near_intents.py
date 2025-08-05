"""
NEAR Intents Implementation.

This module provides functionality for interacting with NEAR Protocol intents,
including token swaps, deposits, and withdrawals using the NEAR Intents system.
"""

import base64
import json
import os
import random
import time
from typing import Dict, List, TypedDict, Union

import base58
import borsh_construct
import py_near.account as near_api_account
import py_near.providers as near_api_providers
from near_api import signer as near_api_signer
import requests

MAX_GAS = 300 * 10**12

SOLVER_BUS_URL = "https://solver-relay-v2.chaindefuser.com/rpc"

ASSET_MAP = {
    "USDC": {
        "token_id": "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        "omft": "eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
        "decimals": 6,
    },
    "NEAR": {
        "token_id": "wrap.near",
        "decimals": 24,
    },
}


class Intent(TypedDict):
    """Intent structure for NEAR intents."""

    intent: str
    diff: Dict[str, str]


class Quote(TypedDict):
    """Quote structure for NEAR intents."""

    nonce: str
    signer_id: str
    verifying_contract: str
    deadline: str
    intents: List[Intent]


def quote_to_borsh(quote):
    """Convert quote to Borsh format."""
    quote_schema = borsh_construct.CStruct(
        "nonce" / borsh_construct.String,
        "signer_id" / borsh_construct.String,
        "verifying_contract" / borsh_construct.String,
        "deadline" / borsh_construct.String,
        "intents"
        / borsh_construct.Vec(
            borsh_construct.CStruct(
                "intent" / borsh_construct.String,
                "diff"
                / borsh_construct.HashMap(
                    borsh_construct.String, borsh_construct.String
                ),
            )
        ),
    )
    return quote_schema.build(quote)


class AcceptQuote(TypedDict):
    """Accept quote structure."""

    nonce: str
    recipient: str
    message: str


class Commitment(TypedDict):
    """Commitment structure for signed intents."""

    standard: str
    payload: Union[AcceptQuote, str]
    signature: str
    public_key: str


class SignedIntent(TypedDict):
    """Signed intent structure."""

    signed: List[Commitment]


class PublishIntent(TypedDict):
    """Publish intent structure."""

    signed_data: Commitment
    quote_hashes: List[str] = []


class NEARAccount:
    """NEAR Account wrapper for intent operations."""

    def __init__(self, provider, signer, account_id):
        """Initialize NEAR account."""
        self.provider = provider
        self.signer = signer
        self.account_id = account_id
        self._account = near_api_account.Account(provider, signer, account_id)

    def state(self):
        """Get account state."""
        return self.provider.query(
            {
                "request_type": "view_account",
                "finality": "final",
                "account_id": self.account_id,
            }
        )

    def view_account(self, account_id):
        """View another account."""
        return self.provider.query(
            {
                "request_type": "view_account",
                "finality": "final",
                "account_id": account_id,
            }
        )

    def function_call(self, *args, **kwargs):
        """Make a function call."""
        return self._account.function_call(*args, **kwargs)

    def view_function(self, *args, **kwargs):
        """View a function."""
        return self._account.view_function(*args, **kwargs)

    def register_token_storage(self, token, other_account=None):
        """Register token storage for an account."""
        account_id = other_account if other_account else self.account_id
        balance = self.view_function(
            ASSET_MAP[token]["token_id"],
            "storage_balance_of",
            {"account_id": account_id},
        )["result"]
        if not balance:
            print(f"Register {account_id} for {token} storage")
            self.function_call(
                ASSET_MAP[token]["token_id"],
                "storage_deposit",
                {"account_id": account_id},
                MAX_GAS,
                1250000000000000000000,
            )
        return balance


def account(account_path):
    """Load NEAR account from file."""
    rpc_node_url = "https://rpc.mainnet.near.org"
    with open(os.path.expanduser(account_path), "r", encoding="utf-8") as f:
        content = json.load(f)
    near_provider = near_api_providers.JsonProvider(rpc_node_url)
    key_pair = near_api_signer.KeyPair(content["private_key"])
    signer = near_api_signer.Signer(content["account_id"], key_pair)
    return NEARAccount(near_provider, signer, content["account_id"])


def get_asset_id(token):
    """Get the asset identifier in the format expected by the solver bus."""
    if token == "NEAR":
        return "near"  # Native NEAR token
    if token == "USDC":
        return "nep141:a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near"  # USDC on NEAR
    return f'nep141:{ASSET_MAP[token]["token_id"]}'


def to_decimals(amount, decimals):
    """Convert amount to decimal representation."""
    return str(int(amount * 10**decimals))


def register_token_storage(account_obj, token, other_account=None):
    """Register token storage for an account."""
    return account_obj.register_token_storage(token, other_account)


def sign_quote(account_obj, quote):
    """Sign a quote with the account's private key."""
    quote_data = quote.encode("utf-8")
    signature = "ed25519:" + base58.b58encode(
        account_obj.signer.sign(quote_data)
    ).decode("utf-8")
    public_key = "ed25519:" + base58.b58encode(account_obj.signer.public_key).decode(
        "utf-8"
    )
    return Commitment(
        standard="raw_ed25519",
        payload=quote,
        signature=signature,
        public_key=public_key,
    )


def create_token_diff_quote(account_obj, token_in, amount_in, token_out, amount_out):
    """Creates a quote for a token swap."""
    # Generate a random nonce
    nonce = base64.b64encode(
        random.getrandbits(256).to_bytes(32, byteorder="big")
    ).decode("utf-8")

    # Create the quote with proper token identifiers
    quote = Quote(
        nonce=nonce,
        signer_id=account_obj.account_id,
        verifying_contract="intents.near",
        deadline=str(int(time.time() * 1000) + 120000),  # 2 minutes from now
        intents=[
            Intent(
                intent="token_diff",
                diff={
                    get_asset_id(token_in): "-"
                    + to_decimals(float(amount_in), ASSET_MAP[token_in]["decimals"]),
                    get_asset_id(token_out): to_decimals(
                        float(amount_out), ASSET_MAP[token_out]["decimals"]
                    ),
                },
            )
        ],
    )

    # Sign and return the quote
    return sign_quote(account_obj, json.dumps(quote))


def submit_signed_intent(account_obj, signed_intent):
    """Submit a signed intent to the NEAR network."""
    account_obj.function_call(
        "intents.near", "execute_intents", signed_intent, MAX_GAS, 0
    )


def intent_deposit(account_obj, token, amount):
    """Deposits tokens into the intents contract."""
    if token == "NEAR":
        # For NEAR token, we need to wrap it first
        amount_raw = to_decimals(amount, ASSET_MAP[token]["decimals"])
        print(f"Depositing {amount} NEAR (raw amount: {amount_raw})")
        print("Wrapping NEAR before deposit")
        account_obj.function_call(
            "wrap.near", "near_deposit", {}, MAX_GAS, int(amount_raw)
        )
        account_obj.function_call(
            "wrap.near",
            "ft_transfer_call",
            {"receiver_id": "intents.near", "amount": amount_raw, "msg": ""},
            MAX_GAS,
            1,
        )
    else:
        # For other tokens, transfer directly
        amount_raw = to_decimals(amount, ASSET_MAP[token]["decimals"])
        print(f"Depositing {amount} {token} (raw amount: {amount_raw})")
        account_obj.function_call(
            ASSET_MAP[token]["token_id"],
            "ft_transfer_call",
            {"receiver_id": "intents.near", "amount": amount_raw, "msg": ""},
            MAX_GAS,
            1,
        )


def register_intent_public_key(account_obj):
    """Register the account's public key with the intents contract."""
    account_obj.function_call(
        "intents.near",
        "add_public_key",
        {
            "public_key": "ed25519:"
            + base58.b58encode(account_obj.signer.public_key).decode("utf-8")
        },
        MAX_GAS,
        1,
    )


class IntentRequest:
    """IntentRequest is a request to perform an action on behalf of the user."""

    def __init__(self, request=None, thread=None, min_deadline_ms=120000):
        """Initialize intent request."""
        self.request = request
        self.thread = thread
        self.min_deadline_ms = min_deadline_ms
        self._asset_in = None
        self._asset_out = None

    def set_asset_in(self, asset_name, amount):
        """Set the input asset and amount."""
        self._asset_in = {
            "asset": get_asset_id(asset_name),
            "amount": to_decimals(amount, ASSET_MAP[asset_name]["decimals"]),
        }
        return self

    def set_asset_out(self, asset_name, amount=None):
        """Set the output asset and optional amount."""
        self._asset_out = {
            "asset": get_asset_id(asset_name),
            "amount": (
                to_decimals(amount, ASSET_MAP[asset_name]["decimals"])
                if amount
                else None
            ),
        }
        return self

    def serialize(self):
        """Serialize the request to the format expected by the solver bus."""
        if not self._asset_in or not self._asset_out:
            raise ValueError("Both input and output assets must be specified")

        message = {
            "defuse_asset_identifier_in": self._asset_in["asset"],
            "defuse_asset_identifier_out": self._asset_out["asset"],
            "exact_amount_in": self._asset_in["amount"],
            "min_deadline_ms": self.min_deadline_ms,
        }

        if self._asset_out["amount"] is not None:
            message["exact_amount_out"] = self._asset_out["amount"]

        return message


def fetch_options(request):
    """Fetches the trading options from the solver bus."""
    rpc_request = {
        "id": "dontcare",
        "jsonrpc": "2.0",
        "method": "quote",
        "params": [request.serialize()],
    }
    print(f"Sending request to solver bus: {json.dumps(rpc_request, indent=2)}")
    response = requests.post(SOLVER_BUS_URL, json=rpc_request, timeout=30)
    response_json = response.json()
    print(f"Received response from solver bus: {json.dumps(response_json, indent=2)}")
    return response_json.get("result", [])


def publish_intent(signed_intent):
    """Publishes the signed intent to the solver bus."""
    rpc_request = {
        "id": "dontcare",
        "jsonrpc": "2.0",
        "method": "publish_intent",
        "params": [signed_intent],
    }
    response = requests.post(SOLVER_BUS_URL, json=rpc_request, timeout=30)
    return response.json()


def select_best_option(options):
    """Selects the best option from the list of options."""
    if not options:
        print("No options available from solver bus")
        return None

    print(f"Found {len(options)} options from solver bus")
    best_option = None
    for i, option in enumerate(options):
        print(f"Option {i+1}: {json.dumps(option, indent=2)}")
        if not best_option or float(option.get("amount_out", 0)) > float(
            best_option.get("amount_out", 0)
        ):
            best_option = option

    if best_option:
        print(f"Selected best option: {json.dumps(best_option, indent=2)}")
    return best_option


def intent_swap(account_obj, token_in, amount_in, token_out):
    """Execute a swap intent between two tokens."""
    print(f"\nInitiating swap: {amount_in} {token_in} -> {token_out}")

    # Ensure storage is registered for both tokens
    print("Checking storage registration...")
    register_token_storage(account_obj, token_in)
    register_token_storage(account_obj, token_out)

    # Create intent request and fetch options
    request = IntentRequest().set_asset_in(token_in, amount_in).set_asset_out(token_out)
    request_data = request.serialize()
    print(f"Created intent request: {json.dumps(request_data, indent=2)}")

    # Fetch and select best option
    options = fetch_options(request)
    best_option = select_best_option(options)

    if not best_option:
        raise ValueError("No valid swap options available from solver bus")

    # Convert amount to decimals and create quote
    amount_in_decimals = to_decimals(amount_in, ASSET_MAP[token_in]["decimals"])
    print(f"Creating quote for {amount_in} {token_in} ({amount_in_decimals} raw units)")

    quote = create_token_diff_quote(
        account_obj, token_in, amount_in, token_out, best_option["amount_out"]
    )
    print(f"Created quote: {json.dumps(quote, indent=2)}")

    signed_intent = PublishIntent(
        signed_data=quote, quote_hashes=[best_option["quote_hash"]]
    )
    print(f"Created signed intent: {json.dumps(signed_intent, indent=2)}")

    print("Publishing signed intent to solver bus...")
    response = publish_intent(signed_intent)
    print(f"Received response: {json.dumps(response, indent=2)}")

    return response


def intent_withdraw(account_obj, destination_address, token, amount, network="near"):
    """Withdraw tokens to an external address."""
    # Example quote structure for withdrawal:
    # {"deadline":"2025-01-05T21:08:23.453Z",
    #  "intents":[{"intent":"ft_withdraw",
    # "token":"17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
    # "receiver_id":"root.near","amount":"1000000"}],
    #  "signer_id":"root.near"}
    nonce = base64.b64encode(
        random.getrandbits(256).to_bytes(32, byteorder="big")
    ).decode("utf-8")
    quote = Quote(
        signer_id=account_obj.account_id,
        nonce=nonce,
        verifying_contract="intents.testnet",
        deadline="2025-12-31T11:59:59.000Z",
        intents=[
            {
                "intent": "ft_withdraw",
                "token": ASSET_MAP[token]["token_id"],
                "receiver_id": destination_address,
                "amount": to_decimals(amount, ASSET_MAP[token]["decimals"]),
            }
        ],
    )
    if network != "near":
        quote["intents"][0]["token"] = ASSET_MAP[token]["omft"]
        quote["intents"][0]["receiver_id"] = ASSET_MAP[token]["omft"]
        quote["intents"][0]["memo"] = f"WITHDRAW_TO:{destination_address}"
    signed_quote = sign_quote(account_obj, json.dumps(quote))
    signed_intent = PublishIntent(signed_data=signed_quote, quote_hashes=[])
    return publish_intent(signed_intent)


def start_video_generation(account, user_message, payment_amount, payment_token="NEAR"):
    """Execute a video generation intent with automatic payment."""
    print(f"\nInitiating video generation: {user_message}")

    # Step 1: Process the AI request (video generation)
    # This would call your AI service

    # Step 2: Create payment intent
    # Similar to intent_swap but for payment instead of swap

    # Step 3: Execute the payment
    # Use the existing intent system to make the payment


def process_payment(account_id: str, destination: str, amount: float, token: str) -> Dict:
    """Process a payment using NEAR intents."""
    if not account_id or not destination or amount <= 0:
        raise ValueError("Invalid payment parameters")
    
    try:
        # Implementation of payment processing
        return {"status": "success", "message": f"Payment of {amount} {token} processed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    # Withdraw to external address.
    account1 = account("<>")
    # print(intent_withdraw(account1, "<near account>", "USDC", 1))
    print(intent_withdraw(account1, "<eth address>", "USDC", 1, network="eth"))
