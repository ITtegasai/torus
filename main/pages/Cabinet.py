from decimal import Decimal
import json
import calendar
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from db.db import Connection
from helpers.d2o import PersonEncoder

class Cabinet:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        conn = Connection()
        user = conn.select("users", "uid", uid)
        
        fix_timestamp = 0
        
        if user:
            if user["result"].fix_timestamp != None:
                # print(user["result"].fix_timestamp)
                # print(type(user["result"].fix_timestamp))
                # print(datetime.strptime(user["result"].fix_timestamp, '%Y-%m-%d').date())
                fix_timestamp = datetime.strptime(user["result"].fix_timestamp, '%Y-%m-%d').date() + relativedelta(months=1)
                fix_timestamp = calendar.timegm(fix_timestamp.timetuple())
            
        
        current_price = conn.select("packages", "id", "1")
        current_price = current_price["result"]
        current_price = float(current_price.price)
        
            
                
        tr = conn.selectWhereStr(f"SELECT SUM(amount), SUM(amount/price) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and type = 0 and status = 3 and package_id = 1;")
        
        amount = 0
        count = 0
        print(tr)
        if tr[0][0]:
            amount = float(tr[0][0])
        if tr[0][1]:
            count = int(tr[0][1])
            
        trb1 = conn.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and type = 0 and status = 3 and package_id = 1 ORDER BY update_at ASC;")
        trb2 = conn.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and type = 0 and status = 3 and package_id = 2 ORDER BY update_at ASC;")
        
        balance1 = 0
        for trbi1 in trb1:
            prev1 = int(Decimal(trbi1[0]) // Decimal(trbi1[1]))
            balance1 += Decimal(trbi1[0] - (Decimal(prev1) * Decimal(trbi1[1])))
            if Decimal(balance1) >= Decimal(trbi1[1]):
                balance1 -= Decimal(trbi1[1])
                
        balance2 = 0
        for trbi2 in trb2:
            prev2 = int(Decimal(trbi2[0]) // Decimal(trbi2[1]))
            balance2 += Decimal(trbi2[0] - (Decimal(prev2) * Decimal(trbi2[1])))
            if Decimal(balance2) >= Decimal(trbi2[1]):
                balance2 -= Decimal(trbi2[1])
        balance = float(balance1 + balance2)
        balance = round(balance, 2)
        conn.disconnect()
        
        
        user_data = {"amount": amount, "count": count, "dividends": float(0), "current_price": current_price, "fix_timestamp": fix_timestamp, "balance": balance} #дописать дивиденды
        return json.dumps(user_data, cls=PersonEncoder)