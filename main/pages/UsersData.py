import json
from db.db import Connection
from helpers.d2o import PersonEncoder

'''
params = {"uid"} | None
'''

class UsersData:
    def get(self, params: dict = None):
        conn = Connection()

        if params:
            users = conn.select("user_data", "uid", params["uid"])
        else:
            users = conn.select("user_data")

        conn.disconnect()
        usersData = usersData["result"]
        return json.dumps(usersData, cls=PersonEncoder)