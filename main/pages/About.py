import json
from db.db import Connection
from helpers.d2o import PersonEncoder

class About:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = "ru"):
        if filter == None:
            filter = "ru"
        conn = Connection()
        about = conn.selectWhereStr(f"SELECT {filter} FROM texts WHERE const = 'about';")
        conn.disconnect()
        data = {"text": about[0][0]}
        return json.dumps(data, cls=PersonEncoder)