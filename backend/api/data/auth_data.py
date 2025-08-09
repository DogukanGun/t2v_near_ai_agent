from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    otp: str


class LoginData(BaseModel):
    access_token: str
    token_type: str


class User(UserBase):
    username: str
    wallet_address: Optional[str] = None
    disabled: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    scopes: List[str] = []
