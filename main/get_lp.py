from datetime import datetime, timezone, timedelta
import calendar
from dateutil.relativedelta import relativedelta
from hashlib import blake2b
import hashlib
import json
import math
import time
from db.db import Connection
from helpers.d2o import PersonEncoder

def get_lb(user_id):
    conn2 = Connection()
    refs = conn2.selectWhereStr(f"SELECT user_id FROM user_data WHERE reffer_id = {user_id};")
    lb = 0
    if refs:
        refs = [int(x[0]) for x in refs]
        
        string = ""
        for l in range(len(refs)):
            string += f"user_id = {refs[l]}"
            if l < len(refs) - 1:
                string += " or "
        lb = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE dog_id > 0 and update_at >= '2025-01-31 03:00:00' and update_at < '2025-03-01 03:00:00' and status = 3 and type = 0 and ({string});")
        if lb:
            lb = int(lb[0][0])
        else:
            lb = 0
    conn2.disconnect()
    return lb

conn2 = Connection()
users = conn2.select("users")
users = users["result"]
conn2.disconnect()

csv = f"username, action, amount\n"

for u in users:
    amount = get_lb(u.id)
    if float(amount) > 0:
        amount2 = float(amount) * 30000
        csv += f"{u.username}, {amount}, {amount2}\n"
    
with open('users_lb.csv', 'w') as tr:
    tr.write(csv)