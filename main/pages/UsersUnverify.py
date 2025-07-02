import json
from db.db import Connection
from helpers.d2o import PersonEncoder

'''
params = {"uid"} | None
'''

class UsersUnverify:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = {"Users": {"uid": "uid"}, "UserData": {"first_name": "first_name"}}
        '''
        
        conn = Connection()
            
        count = conn.selectWhereStr(f"SELECT COUNT(id) FROM users;")
        
        if count[0][0]:
            count = count[0][0]
        else:
            count = 0
        
        where_u = ""
        where_ud = ""
        if filter:
            i = 0
            count_filter = len(filter)
            if "Users" in filter:
                for f in filter["Users"].keys():
                    fs = filter['Users'][f].split(" ")
                    where_u += f"users.{f} {fs[0]} '{' '.join(fs[1:])}'"
                    if i < count_filter - 1:
                        where_u += " and "
                    i += 1
                    
                where_u = f"and {where_u}"
            if "UserData" in filter:
                for f in filter["UserData"].keys():
                    fs = filter['UserData'][f].split(" ")
                    where_ud += f"user_data.{f} {fs[0]} '{' '.join(fs[1:])}'"
                    if i < count_filter - 1:
                        where_ud += " and "
                    i += 1
                    
                where_ud = f"and {where_ud}"
        
        if where_u == "" and where_ud == "":
            users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id WHERE role=0 ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
            column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
        elif where_ud == "":
            users = conn.selectWhereStr(f"SELECT * FROM users INNER JOIN user_data ON users.id = user_data.user_id WHERE role=0 {where_u} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
            column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;")]
        elif where_u == "":
            users = conn.selectWhereStr(f"SELECT * FROM user_data INNER JOIN users ON user_data.user_id = users.id WHERE role=0 {where_ud} ORDER BY users.id DESC LIMIT {limit} OFFSET {offset};")
            column = [*conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' ORDER BY ordinal_position;"), *conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;")]
        
        
        conn.disconnect()

        result = []

        for tr in users:
            obj = {}
            for col in range(len(column)):
                row = tr[col]
                if str(type(row)) == "<class 'datetime.datetime'>":
                    row = str(row).split(".")[0]
                elif str(type(row)) == "<class 'decimal.Decimal'>":
                    row = float(row)
                obj[column[col][0]] = row
            result.append(obj)
            
        users = {"users": result, "count": count}
        
        return json.dumps(users, cls=PersonEncoder)