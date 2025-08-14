"""
Email utility functions to avoid code duplication.
"""

from notification.data import EmailMissingKeysException
from utils.constants.environment_keys import EnvironmentKeys
from utils.environment_manager import EnvironmentManager
from utils.logger import logger


def validate_email_environment(env_map: EnvironmentManager) -> None:
    """
    Validate that required email environment variables are set.

    Args:
        env_map: Environment manager instance

    Raises:
        EmailMissingKeysException: If email or password keys are missing
    """
    if (
        env_map.get_key(EnvironmentKeys.EMAIL.value) is None
        or env_map.get_key(EnvironmentKeys.EMAIL_PASSWORD.value) is None
    ):
        logger.error(
            "Email or password keys in environment are missing or are named wrongly"
        )
        raise EmailMissingKeysException("Email server cannot be initialized")
