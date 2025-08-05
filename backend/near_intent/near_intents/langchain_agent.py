import os
import logging
from typing import Optional

from langchain.agents import initialize_agent, Tool
from langchain.agents.agent_types import AgentType
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from dotenv import load_dotenv

from ai_agent import AIAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AI Agent globally (can also be session-based)
AGENT_KEY_PATH = os.getenv("NEAR_ACCOUNT_FILE", "./account_file.json")
agent: Optional[AIAgent] = None

def get_agent() -> AIAgent:
    global agent
    if agent is None:
        logger.info(f"Initializing AI agent with account file: {AGENT_KEY_PATH}")
        agent = AIAgent(AGENT_KEY_PATH)
    return agent

# Define LangChain tool
@tool
def swap_near_to_token(amount: float, token: str) -> str:
    """
    Swap a given amount of NEAR into a target token like USDC using the NEAR intent system.
    
    Parameters:
    - amount (float): The amount of NEAR to swap.
    - token (str): The symbol of the target token (e.g., 'USDC').
    
    Returns:
    - str: Result of the transaction or error message.
    """
    try:
        agent_instance = get_agent()
        logger.info(f"Attempting to swap {amount} NEAR to {token}")
        result = agent_instance.swap_near_to_token(token, amount)
        return f"Swap successful: {result}"
    except Exception as e:
        logger.exception("Swap failed")
        return f"Swap failed: {str(e)}"

@tool
def deposit_near(amount: float) -> str:
    """
    Deposit NEAR into the intent contract to enable swaps.
    
    Parameters:
    - amount (float): Amount of NEAR to deposit.

    Returns:
    - str: Result of the deposit transaction.
    """
    try:
        agent_instance = get_agent()
        logger.info(f"Depositing {amount} NEAR")
        agent_instance.deposit_near(amount)
        return f"Deposit successful: {amount} NEAR deposited"
    except Exception as e:
        logger.exception("Deposit failed")
        return f"Deposit failed: {str(e)}"

@tool
def register_token_storage(token: str) -> str:
    """
    Registers token storage for a given token if required by the contract.

    Parameters:
    - token (str): Token symbol (e.g., 'USDC')

    Returns:
    - str: Result of the registration
    """
    try:
        agent_instance = get_agent()
        logger.info(f"Registering token storage for: {token}")
        from near_intents import register_token_storage as register_storage
        register_storage(agent_instance.account, token)
        return f"Token storage registered for {token}"
    except Exception as e:
        logger.exception("Token storage registration failed")
        return f"Token storage registration failed: {str(e)}"

# LangChain tool list
tools = [
    swap_near_to_token,
    deposit_near,
    register_token_storage
]

# LangChain LLM agent
def create_langchain_agent():
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    return initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True
    )

# Example usage
if __name__ == "__main__":
    agent = create_langchain_agent()
    result = agent.run("Swap 2.5 NEAR to USDC")
    print(result)