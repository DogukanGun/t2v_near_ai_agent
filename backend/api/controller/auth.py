import logging
import uuid
from datetime import timedelta
from typing import Annotated, Any, Dict, List

import base58
import requests
from api.data.auth_data import User
from api.data.general import return_success_response
from error_handler.error_codes import ErrorCode
from error_handler.response_handler import return_error_message
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from nacl.signing import SigningKey
from notification.data import OTPNotification
from notification.user_notification import send_notification_to_user
from utils.constants.collection_name import CollectionName
from utils.database import Database, get_db
from utils.environment_manager import (EnvironmentManager,
                                       get_environment_manager)
from utils.security.authenticate import create_access_token
from utils.security.otp import generate_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Auth"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_token(
    username: str, scopes: List[str], env_manager: EnvironmentManager
) -> str:
    access_token_expires = timedelta(hours=8)
    return create_access_token(
        env_manager=env_manager,
        data={"sub": username, "scopes": scopes},
        expires_delta=access_token_expires,
    )


def faucet(account_id: str, public_key_near: str):
    url = "https://helper.testnet.near.org/account"
    res = requests.post(
        url, json={"newAccountId": account_id, "newAccountPublicKey": public_key_near}
    )
    return res.status_code == 200


def create_near_account() -> Dict[str, str]:
    """
    Create a new NEAR account key pair.

    Returns:
        Dictionary with account_id, public_key, and private_key
    """
    try:
        sk = SigningKey.generate()
        vk = sk.verify_key

        private_key_near = "ed25519:" + base58.b58encode(sk.encode()).decode()
        public_key_near = "ed25519:" + base58.b58encode(vk.encode()).decode()
        account_id = "mytest-" + public_key_near[-6:] + ".testnet"  # simple unique name

        success = faucet(account_id, public_key_near)

        if not success:
            raise HTTPException(status_code=404, detail="Account not found")
        logger.info(f"Created new NEAR account: {public_key_near}")

        return {
            "account_id": account_id,
            "public_key": public_key_near,
            "private_key": private_key_near,
        }
    except Exception as e:
        logger.error(f"Error creating NEAR account: {str(e)}")
        # Return empty values in case of error
        return {"account_id": "error.near", "public_key": "", "private_key": ""}


@router.post("/login/{user_identifier}")
def login(
    user_identifier: str,
    db: Database = Depends(get_db),
    env_manager: EnvironmentManager = Depends(get_environment_manager),
):
    user = db.get_single_object(
        CollectionName.USER.value,
        {"username": user_identifier},
    )
    if user is None:
        # New user - create a NEAR account
        near_account = create_near_account()

        # Create a new user with NEAR account details
        new_user = {
            "username": user_identifier,
            "account_id": near_account["account_id"],
            "public_key": near_account["public_key"],
            "private_key": near_account["private_key"],
        }

        # Insert the new user into the database
        db.insert_object(CollectionName.USER.value, new_user)
        username = user_identifier

        logger.info(f"Created new user with NEAR account: {user_identifier}")
    else:
        user_obj = User(**user)
        username = user_obj.username

        # Check if user already has NEAR account, if not create one
        if not hasattr(user_obj, "private_key") or not user_obj.private_key:
            near_account = create_near_account()

            # Update user with NEAR account details
            db.update_object(
                CollectionName.USER.value,
                {"username": username},
                {
                    "account_id": near_account["account_id"],
                    "public_key": near_account["public_key"],
                    "private_key": near_account["private_key"],
                },
            )

            logger.info(f"Added NEAR account to existing user: {username}")

    # Generate and send OTP
    otp_code = generate_otp(env_manager)
    send_notification_to_user(
        db,
        username,
        OTPNotification("Your otp code", "OTP Code", otp_code),
    )
    return return_success_response()


def get_user(db: Database, form_data: OAuth2PasswordRequestForm) -> [Any]:
    return db.get_object(CollectionName.USER.value, {"username": form_data.username})


@router.post("/login")
def verify_otp_by_code(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    env_manager: EnvironmentManager = Depends(get_environment_manager),
    db: Database = Depends(get_db),
):
    res = verify_otp(form_data.password, env_manager)
    if not res:
        return return_error_message(db, ErrorCode.WRONG_OTP_CODE)

    # Fetch user data including NEAR account details
    user = db.get_single_object(
        CollectionName.USER.value, {"username": form_data.username}
    )

    # Create token and include NEAR account_id in the response
    access_token = create_token(form_data.username, [], env_manager)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "account_id": user.get("account_id", ""),
    }
