import calendar
from decimal import Decimal
import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from marketing.qualifications import get_go, get_lo
from datetime import datetime, timedelta

'''
params = {"uid"} | None
'''

def represents_number(s):
    try: 
        float(s)
    except ValueError:
        return False
    else:
        return True


class Users:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = {"Users": {"uid": "uid"}, "UserData": {"first_name": "first_name"}}
        '''
        
        conn = Connection()
            
        
        where_u = ""
        where_ud = ""
        sort = "DESC"
        print(filter)
        if filter != "":
            i = 0
            if "Users" in filter:
                if "sort" in filter["Users"]:
                    if int(filter["Users"]["sort"]) == 1:
                        sort = "ASC"
                    del filter["Users"]["sort"]
                count_filter = len(filter["Users"])
                for f in filter["Users"].keys():
                    
                    if filter['Users'][f] != "":
                        if f == "minLo":
                            where_u += f"users.lo > {filter['Users'][f]}"
                        elif f == "maxLo":
                            where_u += f"users.lo < {filter['Users'][f]}"
                        elif f == "reffer_login":
                            rid = conn.selectWhereStr(f"SELECT id FROM users WHERE username LIKE '%{filter['Users'][f]}%'")
                            if len(rid) > 0:
                                if len(rid) > 1:
                                    where_u += '('
                                for r in range(len(rid)):
                                    where_u += f"user_data.reffer_id = {rid[r][0]}"
                                    if r < len(rid) - 1:
                                        where_u += " or "
                                if len(rid) > 1:
                                    where_u += ')'
                        elif f == "dateFrom":
                            where_u += f"reg_date >= '{filter['Users'][f]}'"
                        elif f == "dateTo":
                            where_u += f"reg_date <= '{filter['Users'][f]}'"
                        elif f == "status":
                            if filter['Users'][f] == "0":
                                where_u += "role = 0"
                            elif filter['Users'][f] == "1":
                                where_u += "role = 0 and pending_verification = true"
                            elif filter['Users'][f] == "2":
                                where_u += "role = 0 and rejected_verification_message <> ''"
                            elif filter['Users'][f] == "3":
                                where_u += "role > 0"
                        elif f == "first_name":
                            where_u += f"user_data.{f} LIKE '%{filter['Users'][f]}%'"
                        else:
                            if represents_number(filter['Users'][f]):
                                where_u += f"users.{f} = {filter['Users'][f]}"
                            else:
                                where_u += f"users.{f} LIKE '%{filter['Users'][f]}%'"
                                
                        if i < count_filter - 1:
                            print(i)
                            where_u += " and "
                        i += 1
                    
                if i > 0:
                    where_u = f"WHERE {where_u}"
                
        print(where_u)
        print(where_ud)
        
        lmt = f"LIMIT {limit}"
        ofst = f"OFFSET {offset}"
        
        # if filter != "":
        #     ofst = ""
        #     lmt = ""
        
        
            
        
        # if where_u == "" and where_ud == "":
        users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id {where_u} {where_ud} ORDER BY users.id {sort} {lmt} {ofst};")
        column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
        # elif where_ud == "":
        #     users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id {where_u} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
        #     column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
        # elif where_u == "":
        #     users = conn.selectWhereStr(f"SELECT * FROM user_data INNER JOIN users ON user_data.user_id = users.id {where_ud} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
        #     column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;")]
        count = conn.selectWhereStr(f"SELECT COUNT(users.id) FROM users INNER JOIN user_data ON users.id = user_data.user_id {where_u};")
        
        if count[0][0]:
            count = count[0][0]
        else:
            count = 0

        result = []

        for tr in users:
            obj = {}
            for col in range(len(column)):
                row = tr[col]
                if str(type(row)) == "<class 'datetime.datetime'>":
                    if column[col][0] == "reg_date":
                        timestamp = row + timedelta(hours=3)
                        timestamp = calendar.timegm(timestamp.timetuple())
                        row = timestamp
                    else:
                        nr = row + timedelta(hours=3)
                        row = str(nr).split(".")[0]
                elif str(type(row)) == "<class 'decimal.Decimal'>":
                    row = float(row)
                obj[column[col][0]] = row
            
            lo = get_lo(tr[0])
            go = get_go(tr[0])
            obj["lo"] = int(lo)
            obj["go"] = int(go)
            
            obj["status"] = 0
            
            if tr[4] == 0:
                if tr[19] == True:
                    obj["status"] = 1
                elif tr[18] != '' and tr[18] != '3':
                    obj["status"] = 2
            else:
                obj["status"] = 3
            
            reffer_login = conn.select("users", "id", obj["reffer_id"])
            if reffer_login:
                reffer_login = reffer_login["result"]
                reffer_login = reffer_login.username
            else:
                reffer_login = ""
            obj["reffer_login"] = reffer_login
            
            trb1 = conn.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{tr[1]}') and type = 0 and status = 3 and package_id = 1 ORDER BY update_at ASC;")
            trb2 = conn.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{tr[1]}') and type = 0 and status = 3 and package_id = 2 ORDER BY update_at ASC;")
        
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
            obj["balance"] = balance
            
            result.append(obj)
        conn.disconnect()
        users = {"users": result, "count": count}
        
        return json.dumps(users, cls=PersonEncoder)