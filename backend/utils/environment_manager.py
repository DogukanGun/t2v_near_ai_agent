import os
from typing import Any, Dict, Generator

from dotenv import dotenv_values

from utils.constants.environment_keys import (EnvironmentKeys,
                                              TestEnvironmentKeys)
from utils.logger import logger


class EnvironmentManager:
    environment_values: Dict[str, str] = {}

    def __init__(self, env_file_name="../../.env"):
        env = os.getenv(EnvironmentKeys.OS.value)
        if env == "prod":
            for key in EnvironmentKeys:
                self.environment_values[key.value] = os.getenv(key.value)
        elif env == "test":
            for key in TestEnvironmentKeys:
                self.environment_values[key.value] = os.getenv(key.value)
        else:
            self.environment_values = dotenv_values(env_file_name)

    def get_key(self, key) -> str:
        if key in self.environment_values:
            return self.environment_values[key]
        raise KeyError(f"Key '{key}' not found in environment values.")

    def has_key(self, key) -> bool:
        """Check if a key exists in the environment values."""
        return key in self.environment_values


def get_environment_manager() -> Generator[EnvironmentManager, Any, None]:
    ev_manager = EnvironmentManager()
    try:
        logger.info("Environment manager init is done")
        yield ev_manager
    except Exception as e:
        logger.error(e)
