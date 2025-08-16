from __future__ import annotations

from datetime import datetime, timedelta

from api.data.auth_data import TokenData, User
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from utils.constants.collection_name import CollectionName
from utils.constants.environment_keys import EnvironmentKeys
from utils.database import Database, get_db
from utils.environment_manager import (EnvironmentManager,
                                       get_environment_manager)


class BearAuthException(Exception):
    pass


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login",
    scopes={"me": "Read information about the current user.", "items": "Read items."},
)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    env_manager: EnvironmentManager,
    expires_delta: timedelta | None = None,
):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        env_manager.get_key(EnvironmentKeys.SECRET_KEY.value),
        algorithm=env_manager.get_key(EnvironmentKeys.ALGORITHM.value),
    )
    return encoded_jwt


def get_token_payload(
    token: str = Depends(oauth2_scheme),
    env_manager: EnvironmentManager = Depends(get_environment_manager),
):
    try:
        payload = jwt.decode(
            token,
            env_manager.get_key(EnvironmentKeys.SECRET_KEY.value),
            algorithms=[env_manager.get_key(EnvironmentKeys.ALGORITHM.value)],
        )
        payload_sub: str = payload.get("sub")
        if payload_sub is None:
            raise BearAuthException("Token could not be validated")
        return payload_sub
    except JWTError as exc:
        raise BearAuthException("Token could not be validated") from exc


def authenticate_user(db: Database, username: str = "", password: str = ""):
    users: User = db.get_single_object(
        CollectionName.USER.value, {"username": username}
    )
    if not users:
        return False
    if not verify_password(password, users[0]["password"]):
        return False
    if not verify_password(password, users["password"]):
        return False
    return users


def get_current_user(
    security_scopes: SecurityScopes,
    db: Database = Depends(get_db),
    token: str = Depends(oauth2_scheme),
    env_manager: EnvironmentManager = Depends(get_environment_manager),
) -> User:
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(
            token,
            env_manager.get_key(EnvironmentKeys.SECRET_KEY.value),
            algorithms=[env_manager.get_key(EnvironmentKeys.ALGORITHM.value)],
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)
    except (JWTError, ValidationError) as exc:
        raise credentials_exception from exc
    users = db.get_object(CollectionName.USER.value, {"username": username})
    if users is None or len(users) == 0:
        raise credentials_exception
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise credentials_exception
    return users[0]
