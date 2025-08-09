"""
LangChain Agent Implementation for NEAR Protocol Intents.

This module provides a LangChain-based agent for executing NEAR Protocol intents,
integrating with OpenAI's language models for natural language processing and
decision making in DeFi operations.
"""

import logging
import os
from typing import Any, Dict, Optional

from langchain.agents import AgentExecutor
from langchain.agents.agent_types import AgentType
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI

from .ai_agent import AIAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
ACCOUNT = None
TOOLS = []


def initialize_agent(account_path: str) -> None:
    """
    Initialize the LangChain agent with the given account.

    Args:
        account_path: Path to the NEAR account credentials file
    """
    global ACCOUNT
    try:
        logger.info("Initializing agent with account from: %s", account_path)
        ACCOUNT = AIAgent(account_path)
    except Exception as e:
        logger.error("Failed to initialize agent: %s", str(e))
        raise


def create_deposit_tool() -> BaseTool:
    """
    Create a tool for depositing NEAR tokens.

    Returns:
        BaseTool: A LangChain tool for deposit operations
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

    return BaseTool(
        name="deposit_near",
        description="Deposit NEAR tokens for intent operations",
        func=deposit_near,
    )


def create_swap_tool() -> BaseTool:
    """
    Create a tool for swapping tokens.

    Returns:
        BaseTool: A LangChain tool for swap operations
    """

    def swap_tokens(target_token: str, amount: float) -> Dict[str, Any]:
        try:
            logger.info("Swapping %f NEAR to %s", amount, target_token)
            from .near_intents import register_token_storage

            register_token_storage(ACCOUNT, target_token)
            result = ACCOUNT.swap_near_to_token(target_token, float(amount))
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error("Swap failed: %s", str(e))
            return {"status": "error", "message": str(e)}

    return BaseTool(
        name="swap_tokens",
        description="Swap NEAR tokens to another token type",
        func=swap_tokens,
    )


def setup_agent(openai_api_key: Optional[str] = None) -> AgentExecutor:
    """
    Set up the LangChain agent with necessary tools and configuration.

    Args:
        openai_api_key: Optional API key for OpenAI services

    Returns:
        AgentExecutor: Configured LangChain agent executor
    """
    if not openai_api_key:
        openai_api_key = os.getenv("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OpenAI API key is required")

    llm = ChatOpenAI(temperature=0, model="gpt-4", openai_api_key=openai_api_key)
    tools = [create_deposit_tool(), create_swap_tool()]

    return AgentExecutor.from_agent_and_tools(
        agent_type=AgentType.OPENAI_FUNCTIONS,
        llm=llm,
        tools=tools,
        verbose=True,
    )
