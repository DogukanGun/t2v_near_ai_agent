from typing import Union

from error_handler.error_codes import ErrorCode
from error_handler.response_handler import return_error_message
from notification.data import OTPNotification
from notification.otp_notification import send_notification_for_otp
from utils.constants.collection_name import CollectionName
from utils.database import Database


def send_notification_to_user(
    db: Database,
    username: str,
    data: Union[OTPNotification],
):
    try:
        user = db.get_object(CollectionName.USER.value, {"username": username})[0]
        send_notification_for_otp(user["username"], data)
        return None
    except Exception:
        return return_error_message(db, ErrorCode.EMAIL_SENT_ERROR)
