import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from notification.data import EmailMissingKeysException
from utils.constants.environment_keys import EnvironmentKeys
from utils.environment_manager import EnvironmentManager
from utils.logger import logger


def send_email(email: str, subject: str, title: str, body: str):
    env_map = EnvironmentManager()
    if (
        env_map.get_key(EnvironmentKeys.EMAIL.value) is None
        or env_map.get_key(EnvironmentKeys.EMAIL_PASSWORD.value) is None
    ):
        logger.error(
            "Email or password keys in environment are missing or are named wrongly"
        )
        raise EmailMissingKeysException("Email server cannot be initialized")
    message = MIMEMultipart()
    message["To"] = env_map.get_key(EnvironmentKeys.EMAIL.value)
    message["From"] = env_map.get_key(EnvironmentKeys.EMAIL.value)
    message["Subject"] = subject

    title = title
    message_text = MIMEText(body, "html")
    message.attach(MIMEText(title, "html"))
    message.attach(message_text)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp_server:
        smtp_server.login(
            env_map.get_key(EnvironmentKeys.EMAIL.value),
            env_map.get_key(EnvironmentKeys.EMAIL_PASSWORD.value),
        )
        smtp_server.sendmail(
            env_map.get_key(EnvironmentKeys.EMAIL.value), email, message.as_string()
        )
    logger.info("Message sent!")
