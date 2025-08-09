
from typing import List, Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class LoginData(BaseModel):
    access_token: str
    token_type: str


class User(UserBase):
    username: str
    disabled: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    scopes: List[str] = []
