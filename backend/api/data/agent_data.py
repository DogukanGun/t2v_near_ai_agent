from typing import Optional

from pydantic import BaseModel


class UserRequest(BaseModel):
    """
    Represents a user request to the AI agent.
    """

    message: str
    user_id: Optional[str] = None


class AgentResponse(BaseModel):
    """
    Response from the AI agent processing a user request.
    """

    response: str
    status: str
    transaction_hash: Optional[str] = None


class ChatResponse(BaseModel):
    action: str
    content: Optional[str] = None
    amount: Optional[int] = None
    target_token: Optional[str] = None
