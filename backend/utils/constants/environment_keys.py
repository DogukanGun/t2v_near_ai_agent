from enum import Enum


class EnvironmentKeys(Enum):
    CONNECTION_STRING = "CONNECTION_STRING"
    OS = "OS"
    DB_USER = "DB_USER"
    DB_PASS = "DB_PASS"
    DB_HOST = "DB_HOST"
    DB_PORT = "DB_PORT"
    DB_NAME = "DB_NAME"


class TestEnvironmentKeys(Enum):
    CONNECTION_STRING = "CONNECTION_STRING"
    SECRET_KEY = "SECRET_KEY"
    PRIVATE_KEY = "PRIVATE_KEY"
