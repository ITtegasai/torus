import json
from db.db import Connection
from helpers.d2o import PersonEncoder

'''
params = {"uid"}
'''

class UserData:
    def get(self, params: dict):
        if "uid" not in params:
            return None

        conn = Connection()
        userData = conn.selectWhereString("SELECT * FROM user_data WHERE user_id = (SELECT id FROM users WHERE uid = '{0}');".format(params["uid"]))
        conn.disconnect()
        userData = userData["result"]
        return json.dumps(userData, cls=PersonEncoder)