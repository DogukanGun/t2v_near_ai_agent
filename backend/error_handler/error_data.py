from typing import Optional

from pydantic import BaseModel


class CustomError(BaseModel):
    error_message: str
    go_back: Optional[bool]
    go_home: Optional[bool]
    logout: Optional[bool]
