from datetime import timedelta
from typing import List, Any
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from api.data.auth_data import User, Token
from error_handler.error_codes import ErrorCode
from error_handler.response_handler import return_error_message
from notification.data import OTPNotification, NotificationReasons
from notification.user_notification import send_notification_to_user
from utils.constants.collection_name import CollectionName
from utils.database import Database, get_db
from utils.environment_manager import EnvironmentManager, get_environment_manager
from utils.security.authenticate import create_access_token, authenticate_user
from api.data.general import return_success_response
from utils.security.otp import generate_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Auth"])


def create_token(username: str, scopes: List[str], env_manager: EnvironmentManager) -> str:
    access_token_expires = timedelta(minutes=60 * 60 * 8)
    return create_access_token(
        env_manager=env_manager,
        data={"sub": username, "scopes": scopes},
        expires_delta=access_token_expires,
    )


@router.post("/login/{user_identifier}", response_model=Token)
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
        return return_error_message(db, ErrorCode.OBJECT_NOT_FOUND)
    user_obj = User(**user)
    otp_code = generate_otp(env_manager)
    send_notification_to_user(
        db,
        user_obj.username,
        OTPNotification("Your otp code", "OTP Code", otp_code),
        NotificationReasons.OTP.value
    )
    return return_success_response()

def get_user(db: Database, form_data: OAuth2PasswordRequestForm) -> [Any]:
    return db.get_object(CollectionName.USER.value, {"username": form_data.username})


@router.post("/otp/verify/{code}/{username}")
def verify_otp_by_code(
        code: str,
        username:str,
        env_manager: EnvironmentManager = Depends(get_environment_manager),
        db: Database = Depends(get_db)
):
    res = verify_otp(code, env_manager)
    if not res:
        return return_error_message(db, ErrorCode.WRONG_OTP_CODE)
    access_token = create_token(username, [], env_manager)
    return {"access_token": access_token, "token_type": "bearer"}