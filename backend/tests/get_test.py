from unittest import TestCase

from utils.database import Database


class GetTest(TestCase):
    def test_get_object(self):
        table_name = "test"
        collection_name = "users"
        test_obj = {
            "name": "Dogukan",
            "role": "Owner",
            "test":"get_request"
        }

        # Create a Database instance and insert the test object
        database = Database(table_name)
        obj_id = database.insert_object(collection_name, test_obj)

        # Get the count of documents after the insert
        result = database.get_object(collection_name,{"_id":obj_id})
        assert len(result) == 1
        assert result[0]["_id"] == obj_id