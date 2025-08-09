from enum import Enum


class NotificationMessage:
    def __init__(self, message: str, subject: str):
        self.message = message
        self.subject = subject

    def get_message(self) -> str:
        return self.message

    def get_subject(self) -> str:
        return self.subject


class OTPNotification(NotificationMessage):
    def __init__(self, message: str, subject: str, otp_code: str):
        super().__init__(message, subject)
        self.otp_code = otp_code

    def get_otp_code(self) -> str:
        return self.otp_code


class EmailMissingKeysException(Exception):
    pass


class NotificationReasons(Enum):
    OTP = "OTP"
