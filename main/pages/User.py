import json
from db.db import Connection
from helpers.d2o import PersonEncoder

class User:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        conn = Connection()
        
        us = conn.selectWhereStr(f"select lo from users where uid = '{uid}'")
        
        lo = 0
        if us:
            lo = us[0][0]
            lo = round(float(lo), 2)
        
        user = conn.select("users", "uid", uid, [
            "id",
            "uid",
            "username",
            "role",
            "email",
            "is_online",
            "verified",
            "is_agent"
        ])
        if not user:
            return {}
        user = user["result"]
        userData = conn.selectWhereString("SELECT * FROM user_data WHERE user_id = (SELECT id FROM users WHERE uid = '{0}');".format(uid))
        conn.disconnect()
        userData = userData["result"]
        
        user_data = {"user": user, "userData": userData, "lo": lo}
        return json.dumps(user_data, cls=PersonEncoder)