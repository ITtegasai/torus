import json
from db.db import Connection
from helpers.d2o import PersonEncoder

class News:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = news_id | None
        '''
        conn = Connection()
        if filter:
            news = conn.selectWhereString(f"SELECT * FROM news WHERE id = {filter} and active = true;")
        else:
            news = conn.selectWhereString("SELECT * FROM news WHERE active = true;")
            
        if not news:
            return {}
        
        news = news["result"]
        
        news = {"news": news}
        
        return json.dumps(news, cls=PersonEncoder)