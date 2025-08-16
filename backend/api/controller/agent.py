import json
import logging

from fastapi import APIRouter, Depends, HTTPException

from api.data.auth_data import User
from api.data.general import return_success_response_with_data
from near_intent.near_intents.langchain_agent import setup_agent_and_run
from utils.constants.collection_name import CollectionName
from utils.constants.environment_keys import EnvironmentKeys
from utils.database import Database, get_db
from utils.environment_manager import (EnvironmentManager,
                                       get_environment_manager)
from utils.security.authenticate import get_current_user
from utils.send_email import send_email

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.post("/chat/{message}")
async def chat(
    message: str,
    current_user: User = Depends(get_current_user),
    db: Database = Depends(get_db),
    env_manager: EnvironmentManager = Depends(get_environment_manager),
):
    """
    Process a user message using the LangChain agent with the user's NEAR account.
    """
    try:
        # Get OpenAI API key from environment variable
        api_key = env_manager.get_key(EnvironmentKeys.OPEN_ROUTER_KEY.value)
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")

        # Get the user's account information from the database
        user_data = db.get_single_object(
            CollectionName.USER.value, {"username": current_user["username"]}
        )

        if (
            not user_data
            or not user_data.get("private_key")
            or not user_data.get("account_id")
        ):
            logger.error(f"Missing NEAR account data for user: {current_user.username}")
            raise HTTPException(
                status_code=400, detail="User does not have a valid NEAR account"
            )

        # Create account data from user's stored information
        account_data = {
            "account_id": user_data.get("account_id"),
            "private_key": user_data.get("private_key"),
        }

        # Create a callback function to notify when transactions are done
        def on_transaction_complete():
            username = current_user["username"]
            logger.info(f"Transaction completed for user: {username}")
            send_email(
                email=account_data["account_id"],
                subject="Transaction Completed",
                title="Transaction Completed",
                body=f"Transaction completed for user: {username}",
            )

        # Setup the agent with the API key and user's account
        agent_res = setup_agent_and_run(
            message, api_key, account_data, on_transaction_complete
        )
        clean_res = agent_res.replace("{{", "{").replace("}}", "}")
        data = json.loads(clean_res)
        return return_success_response_with_data(data)
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing request: {str(e)}"
        ) from e
