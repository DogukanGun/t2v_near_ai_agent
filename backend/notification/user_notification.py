from typing import Union

from notification.data import NotificationReasons, OTPNotification
from notification.otp_notification import send_notification_for_otp
from utils.constants.collection_name import CollectionName
from utils.database import Database
from utils.logger import logger


def send_notification_to_user(
    db: Database,
    username: str,
    data: Union[OTPNotification],
    reason: NotificationReasons,
):
    try:
        user = db.get_object(CollectionName.USER.value, {"username": username})[0]
        if user["notification_type"] != "" or user["notification_type"] is not None:
            if reason == NotificationReasons.OTP.value:
                return send_notification_for_otp(
                    user["otp_type"], user["otp_identifier"], data
                )
        else:
            logger.warning("User doesn't have any notification type")
            return return_error_message(
                db, ErrorCode.MISSING_USER_PREF_FOR_NOTIFICATION
            )
    except:
        return return_error_message(db, ErrorCode.EMAIL_SENT_ERROR)
