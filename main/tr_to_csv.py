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
            
conn = Connection(old_env)

users = conn.selectWhereStr("SELECT id, username FROM users;")
currency_rate_history = conn.selectWhereStr("select rate, created_at from currency_rate_history where from_finance_currency_id = 13 ORDER BY created_at ASC;")

new_data = f"username, amount, created, price, method\n"

for u in users:
    finance_account = conn.selectWhereStr(f"select id from finance_accounts where account_owner_id = {u[0]} AND finance_currency_id = 13;")

    for fa in finance_account:
        finance_transactions = conn.selectWhereStr(f"select * from finance_transactions where debit_account_id = {fa[0]} and finance_currency_id = 13;")
        for ft in finance_transactions:
            price = 0.0
            for crh in currency_rate_history:
                # print(ft[7], crh[1])
                if ft[7] <= crh[1]:
                    price = float(crh[0])
                    break
            new_data += f"{str(u[1])}, {str(float(ft[5]))}, {str(ft[7])}, {str(price)}, {str(ft[1])}\n"
                    
    with open('transactions.csv', 'w') as tr:
        tr.write(new_data)
    


