from enum import Enum


class EnvironmentKeys(Enum):
    CONNECTION_STRING = "CONNECTION_STRING"
    OS = "OS"
    MONGO_URI = "MONGO_URI"


class TestEnvironmentKeys(Enum):
    CONNECTION_STRING = "CONNECTION_STRING"
    SECRET_KEY = "SECRET_KEY"
    PRIVATE_KEY = "PRIVATE_KEY"
