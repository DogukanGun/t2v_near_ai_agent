from enum import Enum


class NotificationMessage:
    message: str
    subject: str

    def __init__(self, message: str, subject: str):
        self.message = message
        self.subject = subject


class OTPNotification(NotificationMessage):
    otp_code: str

    def __init__(self, message: str, subject: str, otp_code: str):
        super().__init__(message, subject)
        self.otp_code = otp_code


class EmailMissingKeysException(Exception):
    pass


class NotificationReasons(Enum):
    OTP = "OTP"
