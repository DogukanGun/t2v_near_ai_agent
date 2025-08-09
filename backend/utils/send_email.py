import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from utils.constants.environment_keys import EnvironmentKeys
from utils.email_utils import validate_email_environment
from utils.environment_manager import EnvironmentManager
from utils.logger import logger


def send_email(email: str, subject: str, title: str, body: str):
    env_map = EnvironmentManager()
    validate_email_environment(env_map)
    message = MIMEMultipart()
    message["To"] = env_map.get_key(EnvironmentKeys.EMAIL.value)
    message["From"] = env_map.get_key(EnvironmentKeys.EMAIL.value)
    message["Subject"] = subject

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
