import hashlib
import json
import math
import time
import psycopg2
from psycopg2 import Error
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from helpers.d2o import DictObj, PersonEncoder
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

old_env = {
    "DB_HOST1": "localhost",
    "DB_PORT1": "6432",
    "DB_USER": "four",
    "DB_PASSWORD": "08121983",
    "DB_NAME": "tfg_db"
}

new_env = {
    "DB_HOST1": "pg1.toruscrm.pro",
    "DB_HOST2": "pg2.toruscrm.pro",
    "DB_PORT1": "6432",
    "DB_PORT2": "6433",
    "DB_USER": "four",
    "DB_PASSWORD": "08121983",
    "DB_NAME": "tfg_db"
}

def helper(s):
    s = str(s)
    return "'" + str(s) + "'"

def helper2(k, v):
    string = ""
    for l in range(len(k)):
        string += k[l] + "=" + "'" + str(v[l]) + "',"
    string = string[:len(string) - 1]
    return string

class Connection:
    def __init__(self, db_obj):
        try:
            self.connection = psycopg2.connect(
                user=db_obj["DB_USER"],
                password=db_obj["DB_PASSWORD"],
                host=db_obj["DB_HOST1"],
                port=db_obj["DB_PORT1"],
                database=db_obj["DB_NAME"]
            )
        except (Exception, Error) as error:
            print("Ошибка при работе с PostgreSQL", error)
            return False
    
    def disconnect(self):
        if self.connection:
            self.connection.close()
            
    def insert(self, table: str, keys: list, values: list):
        if len(keys) == len(values):
            try:
                cursor = self.connection.cursor()
                insert_query = "INSERT INTO {0} ({1}) VALUES ({2});".format(table, ', '.join(keys), ', '.join(map(helper, values)))
                cursor.execute(insert_query)
                self.connection.commit()
                cursor.close()
            except (Exception, Error) as error:
                print("Ошибка insert PostgreSQL", error)
        else:
            print("Не совпадает количество ключей и данных")
            
    def update(self, table: str, keys: list, values: list, id: int):
        if len(keys) == len(values):
            try:
                cursor = self.connection.cursor()
                insert_query = "UPDATE {0} set {1} WHERE id = {2};".format(table, helper2(keys, values), str(id))
                cursor.execute(insert_query)
                self.connection.commit()
                cursor.close()
            except (Exception, Error) as error:
                print("Ошибка update PostgreSQL", error)
        else:
            print("Не совпадает количество ключей и данных")

    def updateFromStr(self, s: str):
        try:
            cursor = self.connection.cursor()
            cursor.execute(s)
            self.connection.commit()
            cursor.close()
        except (Exception, Error) as error:
            print("Ошибка update PostgreSQL", error)

    def delete(self, table: str, id: int):
        try:
            cursor = self.connection.cursor()
            insert_query = "DELETE FROM {0} WHERE id={1};".format(table, str(id))
            cursor.execute(insert_query)
            self.connection.commit()
            cursor.close()
        except (Exception, Error) as error:
            print("Ошибка delete PostgreSQL", error)
            
    def select(self, table: str, where_key: str = "", where_value: str = "", key: list = "*"):
        try:
            cursor = self.connection.cursor()
            arr = []
            if where_key != "":
                cursor.execute("SELECT {3} FROM {0} WHERE {1} = '{2}';".format(table, where_key, where_value, ", ".join(map(str, key))))
                arr = cursor.fetchall()
            else:
                cursor.execute("SELECT {1} FROM {0};".format(table, ", ".join(map(str, key))))
                arr = cursor.fetchall()
            cursor.close()
            cursor = self.connection.cursor()
            cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{0}' ORDER BY ordinal_position;".format(table))
            column_names = cursor.fetchall()
            cursor.close()

            d = {"result": []}
            schema = []
            if len(arr) == 0:
                return None
            if key == "*":
                if len(arr) > 1:
                    for a in range(len(arr)):
                        string = {}
                        for cn in range(len(column_names)):
                            if str(type(arr[a][cn])) == "<class 'datetime.datetime'>":
                                string[column_names[cn][0]] = str(arr[a][cn]).split(" ")[0]
                            else:
                                string[column_names[cn][0]] = arr[a][cn]
                            if a == 0:
                                schema.append('obj["result"][i].' + column_names[cn][0])
                        d["result"].append(string)
                else:
                    string = {}
                    i = 0
                    for cn in range(len(column_names)):
                        if str(type(arr[0][i])) == "<class 'datetime.datetime'>":
                            string[column_names[cn][0]] = str(arr[0][i]).split(" ")[0]
                        else:
                            string[column_names[cn][0]] = arr[0][i]
                        schema.append('obj["result"].' + column_names[cn][0])
                        i += 1
                    d["result"] = string
            else:
                if len(arr) > 1:
                    for a in range(len(arr)):
                        string = {}
                        for cn in range(len(column_names)):
                            if column_names[cn][0] in key:
                                if str(type(arr[a][cn])) == "<class 'datetime.datetime'>":
                                    string[column_names[cn][0]] = str(arr[a][cn]).split(" ")[0]
                                else:
                                    string[column_names[cn][0]] = arr[a][cn]
                                if a == 0:
                                    schema.append('obj["result"][i].' + column_names[cn][0])
                        d["result"].append(string)
                else:
                    string = {}
                    i = 0
                    for cn in range(len(column_names)):
                        if column_names[cn][0] in key:
                            if str(type(arr[0][i])) == "<class 'datetime.datetime'>":
                                string[column_names[cn][0]] = str(arr[0][i]).split(" ")[0]
                            else:
                                string[column_names[cn][0]] = arr[0][i]
                            schema.append('obj["result"].' + column_names[cn][0])
                            i += 1
                    d["result"] = string
            obj = DictObj(d)
            
            return {"result": obj.result, "schema": schema}
        except (Exception, Error) as error:
            print("Ошибка select PostgreSQL", error)

    # where_key_value = "key=value, key=value ..."
    def selectWhereList(self, table: str, where_key_value: str = "", key: list = "*"):
        try:
            cursor = self.connection.cursor()
            arr = None
            if where_key_value != "":
                cursor.execute("SELECT {2} FROM {0} WHERE {1};".format(table, where_key_value, ", ".join(map(str, key))))
                arr = cursor.fetchall()
            else:
                cursor.execute("SELECT {1} FROM {0};".format(table, ", ".join(map(str, key))))
                arr = cursor.fetchall()
            cursor.close()
            return arr
        except (Exception, Error) as error:
            print("Ошибка select PostgreSQL", error)

    def selectWhereCase(self, s: str):
        try:
            cursor = self.connection.cursor()
            cursor.execute(s)
            self.connection.commit()
            arr = cursor.fetchall()
            cursor.close()
            return arr
        except (Exception, Error) as error:
            print("Ошибка select PostgreSQL", error)
    
    def selectWhereString(self, s: str):
        try:
            cursor = self.connection.cursor()
            cursor.execute(s)
            self.connection.commit()
            arr = cursor.fetchall()
            cursor.close()


            string = s.split('FROM')
            table = string[1].split('WHERE')[0]
            table = table.strip()
            

            cursor = self.connection.cursor()
            cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{0}' ORDER BY ordinal_position;".format(table))
            column_names = cursor.fetchall()
            cursor.close()

            d = {"result": []}
            schema = []
            #if len(arr) == 0:
            #    return None
            
            if len(arr) > 1:
                for a in range(len(arr)):
                    string = {}
                    for cn in range(len(column_names)):
                        dt = arr[a][cn]
                        if str(type(dt)) == "<class 'datetime.datetime'>":
                            dt = str(dt).split(" ")[0]
                        string[column_names[cn][0]] = dt
                        if a == 0:
                            schema.append('obj["result"][i].' + column_names[cn][0])
                    d["result"].append(string)
            elif len(arr) > 0:
                string = {}
                i = 0
                for cn in range(len(column_names)):
                    dt = arr[0][i]
                    if str(type(dt)) == "<class 'datetime.datetime'>":
                        dt = str(dt).split(" ")[0]
                    string[column_names[cn][0]] = dt
                    schema.append('obj["result"].' + column_names[cn][0])
                    i += 1
                d["result"] = string
            else:
                for cn in range(len(column_names)):
                    schema.append('obj["result"].' + column_names[cn][0])
            obj = DictObj(d)
            
            return {"result": obj.result, "schema": schema}
        except (Exception, Error) as error:
            print("Ошибка select PostgreSQL", error)
            
    def selectWhereStr(self, s: str):
        try:
            cursor = self.connection.cursor()
            cursor.execute(s)
            self.connection.commit()
            arr = cursor.fetchall()
            cursor.close()
            return arr
        except (Exception, Error) as error:
            print("Ошибка select PostgreSQL", error)
            
def confirm_purchase(conn, tx_hash: str, status: int):
    
    transaction = conn.select("transactions", "tx_hash", str(tx_hash))
    
    print(transaction)
    
    user = conn.select("users", "id", str(transaction["result"].user_id))
    
    tsu = datetime.now(timezone.utc)
    
    conn.update("transactions", ["status", "update_at"], [status, tsu], transaction["result"].id)
    
    if transaction["result"].type == 0:
        # -----------------------------------
        is_fixed = user["result"].fix_price
        is_fixed_ts = user["result"].fix_timestamp

        is_fixed_ts = is_fixed_ts or '2000-01-01'
        date_now = int(time.mktime(datetime.strptime(datetime.today().strftime('%Y-%m-%d'), "%Y-%m-%d").timetuple()))
        is_fixed_ts = int(time.mktime(datetime.strptime(is_fixed_ts, "%Y-%m-%d").timetuple()))

        user_id = user["result"].id
        fix_txs = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id={user_id} AND status=3 AND (type=0 OR type=4) AND fixed=FALSE;")

        curent_price = 0
        price = 0

        if is_fixed > 0 and is_fixed_ts - date_now > 0:
            curent_price = float(fix_txs[0][0]) / float(is_fixed)
            price = float(is_fixed)
        else:
            price = conn.select("packages", "id", "1", ["price"])
            curent_price = float(price["result"].price)
            price = float(price["result"].price)
            curent_price = float(fix_txs[0][0]) / float(price)

        f, a = math.modf(curent_price)

        if int(a) > 0:
            conn.updateFromStr(f"UPDATE transactions set fixed = true WHERE user_id = {user['result'].id} AND status=3 AND (type=0 OR type=4) AND fixed = false;")
            conn.insert("finances", ["user_id", "package_id", "package_count", "package_price"], [user["result"].id, 1, a, price])
            ts = datetime.now(timezone.utc)
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price"], [0, 3, 4, user["result"].id, ts, f * price, 1, 0])
        #-----------------------------------
    return {"status": "ok"}
            
conn = Connection(old_env)

users = conn.selectWhereStr("SELECT * FROM users INNER JOIN profiles ON profiles.user_id = users.id")

types_users = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;")
types_profiles = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;")
types_finance = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'finance_accounts' ORDER BY ordinal_position;")
# users = users["result"]
# users = json.loads(json.dumps(users, cls=PersonEncoder))

types = [*types_users, *types_profiles]

js = {"users": []}
for u in users:
    jjs = {}
    for t in range(len(types)):
        jjs[types[t][0]] = str(u[t])
    js["users"].append(jjs)
    
for us in range(len(js["users"])):
    fin = conn.selectWhereStr(f"SELECT * FROM finance_accounts WHERE account_owner_id = {js['users'][us]['id']} AND (finance_currency_id = 13) AND balance > 0;")
    js["users"][us]["finances"] = []
    for jjsf in fin:
        jsf = {}
        for tf in range(len(types_finance)):
            jsf[types_finance[tf][0]] = str(jjsf[tf])
        js["users"][us]["finances"].append(jsf)
        
conn.disconnect()

users = js["users"]

js["users"] = sorted(users, key=lambda x: int(x['id']))

conn = Connection(new_env)

tx_hashs = {"hashs": []}
###################################
for old_user in js["users"]:
    user = conn.select("users", "old_id", old_user["id"])
    
    '''
    type = 0 - покупка акции, 1 - покупка за сумму
    '''
    
    # usd = 0
    akcii = 0
    
    for fin in old_user["finances"]:
        # if int(fin["finance_currency_id"]) == 1:
        #     usd += float(fin["balance"])
        if int(fin["finance_currency_id"]) == 13:
            akcii += float(fin["balance"])
    
    # print(usd)
    print(akcii)
    
    amount = 0
    
    # if usd > 0:
        
    #     typer = 1
    
    #     amount = float(usd) * 100
        
    #     # package = conn.select("packages", "id", "1")
        
    #     # print(package)
        
    #     tx = conn.select("transactions", "user_id", user["result"].id)
        
    #     if not tx and user["result"].role == 1:
    #         conn.update("users", ["role"], [2], user["result"].id)
            
    #     ts = datetime.now(timezone.utc)
        
    #     m = hashlib.shake_256(bytes(user["result"].uid + str(ts),'UTF-8'))

    #     tx_hash = m.hexdigest(4)
            
    #     installment = False
            
    #     conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "installment", "buy_type"], [tx_hash, 0, 0, user["result"].id, ts, amount, 1, 30000, installment, typer])
        
    #     confirm_purchase(conn, tx_hash, 3)
    #     tx_hashs["hashs"].append({"hash": tx_hash})
        
    # amount = 0
        
    if akcii > 0:
    
        typer = 0
        
        # package = conn.select("packages", "id", "1")
        
        tx = conn.select("transactions", "user_id", user["result"].id)
        
        if not tx and user["result"].role == 1:
            conn.update("users", ["role"], [2], user["result"].id)
            
        ts = datetime.now(timezone.utc)
        
        m = hashlib.shake_256(bytes(user["result"].uid + str(ts),'UTF-8'))

        tx_hash = m.hexdigest(4)
        
        amount = int(akcii) * float(30000)
            
        installment = False
            
        conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "installment", "buy_type"], [tx_hash, 0, 0, user["result"].id, ts, amount, 1, 30000, installment, typer])
        
        confirm_purchase(conn, tx_hash, 3)
        tx_hashs["hashs"].append({"hash": tx_hash})

###################################
conn.disconnect()
with open('tx_hashs.json', 'w') as f:
    json.dump(tx_hashs, f)