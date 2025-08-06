from unittest import TestCase

from utils.database import Database


class DeleteTest(TestCase):
    def test_delete_object(self):
        table_name = "test"
        collection_name = "users"
        test_obj = {
            "name": "Dogukan",
            "role": "Owner",
            "test": "insert_request",
        }
        # Create a Database instance and insert the test object
        database = Database(table_name)
        obj_id = database.insert_object(collection_name, test_obj)
        database.delete_object(collection_name)
        obj = database.get_object(collection_name,{"_id":obj_id})
        assert len(obj) != 0
        assert obj[0]["is_deleted"]