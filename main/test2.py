import calendar
import json

from dateutil.relativedelta import relativedelta
from db.db import Connection
from helpers.d2o import PersonEncoder
from marketing.qualifications import get_go, get_lo
from datetime import datetime, timedelta, date, timezone

ts = date.fromisoformat('2025-03-01')
tsnow = ts - relativedelta(months=1)
print(tsnow)

# conn = Connection()

# users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id ORDER BY users.id LIMIT 5;")
# column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
# elif where_ud == "":
#     users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id {where_u} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
#     column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
# elif where_u == "":
#     users = conn.selectWhereStr(f"SELECT * FROM user_data INNER JOIN users ON user_data.user_id = users.id {where_ud} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
#     column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;")]

# result = []

# for tr in users:
#     obj = {}
#     for col in range(len(column)):
#         row = tr[col]
#         if str(type(row)) == "<class 'datetime.datetime'>":
#             if column[col][0] == "reg_date":
#                 timestamp = row + timedelta(hours=3)
#                 timestamp = calendar.timegm(timestamp.timetuple())
#                 row = timestamp
#             else:
#                 nr = row + timedelta(hours=3)
#                 row = str(nr).split(".")[0]
#         elif str(type(row)) == "<class 'decimal.Decimal'>":
#             row = float(row)
#         obj[column[col][0]] = row
    
#     lo = get_lo(tr[0])
#     go = get_go(tr[0])
#     obj["lo"] = int(lo)
#     obj["go"] = int(go)
    
#     for ccc in range(len(column)):
#         print("----------------")
#         print("num: ", ccc, "name:", column[ccc][0])
#         print("----------------")
    
    
#     reffer_login = conn.select("users", "id", obj["reffer_id"])
#     if reffer_login:
#         reffer_login = reffer_login["result"]
#         reffer_login = reffer_login.username
#     else:
#         reffer_login = ""
#     obj["reffer_login"] = reffer_login
    
#     result.append(obj)
    
# conn.disconnect()