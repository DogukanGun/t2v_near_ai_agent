from typing import List, Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class LoginData(BaseModel):
    access_token: str
    token_type: str
    account_id: Optional[str] = None


class User(UserBase):
    username: str
    private_key: Optional[str] = None
    public_key: Optional[str] = None
    account_id: Optional[str] = None
    disabled: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    account_id: Optional[str] = None


class TokenData(BaseModel):
    username: Optional[str] = None
    scopes: List[str] = []


class UserProfile(BaseModel):
    username: str
    account_id: Optional[str] = None
    public_key: Optional[str] = None
    private_key: Optional[str] = None
    twitter_username: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    twitter_username: Optional[str] = None


class ProfileResponse(BaseModel):
    username: str
    account_id: str
    public_key: str
    private_key: str
    twitter_username: Optional[str] = None
