from unittest import TestCase

from utils.database import Database


class UpdateTest(TestCase):
    def test_update_object(self):
        table_name = "test"
        collection_name = "users"
        test_obj = {
            "name": "Dogukan",
            "role": "Owner",
            "test": "insert_request"
        }


        # Create a Database instance and insert the test object
        database = Database(table_name)
        obj_id = database.insert_object(collection_name, test_obj)

        new_name = "Dogukan Updated"
        updated_obj_count = database.update_object(collection_name,{"_id":obj_id},{"name":new_name})
        updated_obj = database.get_object(collection_name,{"_id":obj_id})

        assert updated_obj_count == 1
        assert updated_obj[0]["name"] == new_name