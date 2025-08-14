"""
LangChain Agent Implementation for NEAR Protocol Intents.

This module provides a LangChain-based agent for executing NEAR Protocol intents,
integrating with OpenRouter's language models for natural language processing and
decision making in DeFi operations.
"""

import logging
import os
from typing import Any, Dict, Optional

from langchain.agents import AgentExecutor
from langchain.agents.agent_types import AgentType
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from openai import OpenAI

from utils.constants.environment_keys import EnvironmentKeys
from utils.environment_manager import EnvironmentManager
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


def setup_agent(env_manager:EnvironmentManager) -> AgentExecutor:
    """
    Set up the LangChain agent with necessary tools and configuration.

    Args:

    Returns:
        AgentExecutor: Configured LangChain agent executor
    """

    key = env_manager.get_key(EnvironmentKeys.OPEN_ROUTER_KEY)
    os.putenv("OPENAI_API_KEY",key)

    llm = ChatOpenAI(
        temperature=0,
        model="meta-llama/llama-3.2-3b-instruct:free",
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://ao-agents.vercel.app/",
            "X-Title": "NEAR T2V AI Agent",
        }
    )

    tools = [create_deposit_tool(), create_swap_tool()]

    return AgentExecutor.from_agent_and_tools(
        agent=llm,
        agent_type=AgentType.OPENAI_FUNCTIONS,
        tools=tools,
        verbose=True,
    )
