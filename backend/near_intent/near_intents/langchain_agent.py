"""
LangChain Agent Implementation for NEAR Protocol Intents.

This module provides a LangChain-based agent for executing NEAR Protocol intents,
integrating with OpenRouter's language models for natural language processing and
decision making in DeFi operations.
"""

import logging
import os
from typing import Any, Callable, Dict, Optional

from langchain.tools import Tool
from openai import OpenAI

from .ai_agent import AIAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
ACCOUNT = None
TOOLS = []


def initialize_agent(
    account_data: Dict[str, str], on_sign: Optional[Callable[[], None]] = None
) -> None:
    """
    Initialize the LangChain agent with the given account data.

    Args:
        account_data: Dictionary containing account_id and private_key
        on_sign: Optional callback function to be called when all transactions are completed
    """
    global ACCOUNT
    try:
        logger.info("Initializing agent with account: %s", account_data["account_id"])
        ACCOUNT = AIAgent(account_data, on_sign)
    except Exception as e:
        logger.error("Failed to initialize agent: %s", str(e))
        raise


def create_deposit_tool() -> Tool:
    """
    Create a tool for depositing NEAR tokens.

    Returns:
        Tool: A LangChain tool for deposit operations
    """

    def deposit_near(amount: float) -> Dict[str, Any]:
        if ACCOUNT is None:
            logger.error("ACCOUNT is not initialized. Call initialize_agent() first.")
            return {
                "status": "error",
                "message": "ACCOUNT is not initialized. Call initialize_agent() first.",
            }
        try:
            logger.info("Depositing %f NEAR", amount)
            ACCOUNT.deposit_near(float(amount))
            return {"status": "success", "message": f"Deposited {amount} NEAR"}
        except Exception as e:
            logger.error("Deposit failed: %s", str(e))
            return {"status": "error", "message": str(e)}

    return Tool(
        name="deposit_near",
        description="Deposit NEAR tokens for intent operations",
        func=deposit_near,
    )


def create_swap_tool() -> Tool:
    """
    Create a tool for swapping tokens.

    Returns:
        Tool: A LangChain tool for swap operations
    """

    def swap_tokens(target_token: str, amount: float) -> Dict[str, Any]:
        try:
            logger.info("Swapping %f NEAR to %s", amount, target_token)
            from .near_intents import register_token_storage

            register_token_storage(ACCOUNT.account, target_token)
            result = ACCOUNT.swap_near_to_token(target_token, float(amount))
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error("Swap failed: %s", str(e))
            return {"status": "error", "message": str(e)}

    return Tool(
        name="swap_tokens",
        description="Swap NEAR tokens to another token type",
        func=swap_tokens,
    )


def setup_agent_and_run(
    message: str,
    key: str,
    account_data: Dict[str, str],
    on_sign: Optional[Callable[[], None]] = None,
) -> str | None:
    """
    Set up the LangChain agent with necessary tools and configuration.

    Args:
        key: OpenAI API key
        account_data: Dictionary containing account_id and private_key
        on_sign: Optional callback function to be called when all transactions are completed

    Returns:
        AgentExecutor: Configured LangChain agent executor
    """

    os.putenv("OPENAI_API_KEY", key)

    # Initialize the AI agent with account data
    initialize_agent(account_data, on_sign)

    # Create a system prompt with explicit instructions for structured responses
    system_prompt = """You are a helpful assistant for NEAR Protocol DeFi operations.
You can help users deposit NEAR tokens and swap tokens on NEAR Protocol.
Always provide clear explanations of what you're doing.

IMPORTANT: Instead of using tool calls, you must respond in the following JSON format:

For general responses:
{{
    "action": "message",
    "content": "Your helpful message here"
}}

For deposit operations:
{{
    "action": "deposit",
    "amount": [numeric amount of NEAR to deposit]
}}

For swap operations:
{{
    "action": "swap",
    "target_token": [token symbol to swap to],
    "amount": [numeric amount of NEAR to swap]
}}

Ensure your entire response is valid JSON. Do not include any text before or after the JSON.

"""
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=key,
    )
    completion = client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct:free",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
    )

    return completion.choices[0].message.content
