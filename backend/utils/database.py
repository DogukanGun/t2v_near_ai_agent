from typing import Any, Dict, List, Mapping, Optional, Sequence, TypeVar, Union

from bson.objectid import ObjectId
from pymongo import MongoClient

from utils.constants.environment_keys import EnvironmentKeys
from utils.environment_manager import EnvironmentManager
from utils.logger import logger

T = TypeVar("T")


class MongoDatabase:
    client: MongoClient

    def __init__(self, database_name):
        ev_manager = EnvironmentManager()
        connection_string = ev_manager.get_key(EnvironmentKeys.MONGO_URI.value)
        self.client = MongoClient(
            connection_string
            if connection_string is not None
            else "mongodb://localhost:27017"
        )
        self.database_name = database_name

    def insert_object(self, collection_name: str, obj: Dict[str, Any]) -> ObjectId:
        obj["is_deleted"] = False
        return (
            self.client.get_database(self.database_name)
            .get_collection(collection_name)
            .insert_one(obj)
            .inserted_id
        )

    def get_object(
        self,
        collection_name: str,
        filter_query: Optional[Dict[str, Any]] = None,
        show_deleted: bool = False,
        sort_by: Optional[List[tuple]] = None,
    ) -> List[Any]:
        if filter_query is not None:
            filter_query["is_deleted"] = show_deleted
        else:
            filter_query = {"is_deleted": show_deleted}

        cursor = (
            self.client.get_database(self.database_name)
            .get_collection(collection_name)
            .find(filter=filter_query)
        )

        if sort_by:
            cursor = cursor.sort(sort_by)

        return list(cursor)

    def get_single_object(
        self,
        collection_name: str,
        filter_query: Optional[Dict[str, Any]] = None,
        show_deleted: bool = False,
    ) -> Optional[Any]:
        if filter_query is not None:
            filter_query["is_deleted"] = show_deleted
        else:
            filter_query = {"is_deleted": show_deleted}
        cursor = (
            self.client.get_database(self.database_name)
            .get_collection(collection_name)
            .find(filter=filter_query)
        )
        objs = list(cursor)
        if len(objs) != 1:
            return None
        return objs[0]

    def update_object(
        self,
        collection_name: str,
        filter_query: Dict[str, Any],
        new_data: Union[Mapping[str, Any], Sequence[Mapping[str, Any]]],
        upsert: bool = False,
    ) -> int:
        return (
            self.client.get_database(self.database_name)
            .get_collection(collection_name)
            .update_one(filter=filter_query, update={"$set": new_data}, upsert=upsert)
            .matched_count
        )

    def delete_object(
        self, collection_name: str, filter_query: Optional[Dict[str, Any]] = None
    ) -> int:
        objects = self.get_object(collection_name, filter_query)
        deleted_number = 0
        for obj in objects:
            deleted_number += self.update_object(
                collection_name, {"_id": obj["_id"]}, {"is_deleted": True}
            )
        return deleted_number


class Database(MongoDatabase):
    pass


def get_db():
    db = Database("platform")
    try:
        logger.logger.info("Database init is done")
        yield db
    except Exception as e:
        logger.logger.error(e)
