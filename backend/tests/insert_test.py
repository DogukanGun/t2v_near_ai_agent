from unittest import TestCase

from pymongo import MongoClient

from utils.database import Database


class InsertTest(TestCase):
    def test_insert_object(self):
        table_name = "test"
        collection_name = "users"
        test_obj = {"name": "Dogukan", "role": "Owner", "test": "insert_request"}

        # Establish a connection to the MongoDB server
        mongo_client = MongoClient("mongodb://localhost:27017")

        # Get the initial count of documents in the collection
        initial_count = mongo_client[table_name][collection_name].count_documents({})

        # Create a Database instance and insert the test object
        database = Database(table_name)
        database.insert_object(collection_name, test_obj)

        # Get the count of documents after the insert
        after_insert_count = mongo_client[table_name][collection_name].count_documents(
            {}
        )

        # Close the MongoClient
        mongo_client.close()

        assert initial_count + 1 == after_insert_count
