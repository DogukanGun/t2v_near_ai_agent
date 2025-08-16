from typing import Generic, List, TypeVar

from pydantic import BaseModel
from utils.logger import logger

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    error: bool
    data: T
    error_code: int


def return_success_response() -> BaseResponse[dict]:
    return BaseResponse[dict](error=False, data={"data": "success"}, error_code=-1)


def include_id_if_exists(data: List[T]) -> List[T]:
    for obj in data:
        try:
            if hasattr(obj, "_id") or obj["_id"] is not None:
                obj["id"] = str(obj["_id"])
        except Exception as e:
            logger.error(e)
    return data


def return_success_response_with_data(data: T) -> BaseResponse[T]:
    is_list = True
    if isinstance(data, list):
        data = include_id_if_exists(data)
    else:
        is_list = False
        data = include_id_if_exists([data])
    return BaseResponse[T](
        error=False, data=data if is_list else data[0], error_code=-1
    )
