import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from helpers.d2o import DictObj
from marketing import bonus_types
from datetime import datetime, timedelta

def represents_number(s):
    try: 
        float(s)
    except ValueError:
        return False
    else:
        return True

class Invoices:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = "transactions.amount >= 3000 and transactions.amount < 100001"
        '''
        
        bt = bonus_types.bonus_types()
        
        conn = Connection()
        statuses = ["created", "pending", "rejected", "confirmed"]
        types = ["payment", "withdrawal", "dividends"]
        
        ''' end filter '''
        newf = ""
        where_u = ""
        tx_filter = []
        buy_type_filter = []
        bonus_type_filter = []
        dateFrom_filter = []
        dateTo_filter = []
        initiator_id_filter = []
        package_id_filter = []
        sort = "DESC"
        if filter != "":
            i = 0
            usersids = None
            if "Invoices" in filter:
                if "status" in filter["Invoices"]:
                    tx_filter.append(filter['Invoices']["status"])
                    del filter["Invoices"]["status"]
                
                if "buy_type" in filter["Invoices"]:
                    buy_type_filter.append(filter['Invoices']["buy_type"])
                    del filter["Invoices"]["buy_type"]
                
                if "initiator_id" in filter["Invoices"]:
                    initiator_id_filter.append(filter['Invoices']["initiator_id"])
                    del filter["Invoices"]["initiator_id"]
                    
                if "type" in filter["Invoices"]:
                    package_id_filter.append(filter['Invoices']["type"])
                    del filter["Invoices"]["type"]
                
                if "bonus_type" in filter["Invoices"]:
                    bonus_type_filter.append(filter['Invoices']["bonus_type"])
                    del filter["Invoices"]["bonus_type"]
                
                if "dateFrom" in filter["Invoices"]:
                    dateFrom_filter.append(filter['Invoices']["dateFrom"])
                    del filter["Invoices"]["dateFrom"]
                    
                if "dateTo" in filter["Invoices"]:
                    dateTo_filter.append(filter['Invoices']["dateTo"])
                    del filter["Invoices"]["dateTo"]
                
                if "sort" in filter["Invoices"]:
                    if int(filter["Invoices"]["sort"]) == 1:
                        sort = "ASC"
                    del filter["Invoices"]["sort"]
                
                print("---new filter---")
                print(filter)
                print("---new filter---")
                count_filter = len(filter["Invoices"])
                for f in filter["Invoices"].keys():
                    
                    if filter['Invoices'][f] != "":
                        if f == "minLo":
                            where_u += f"users.lo > {filter['Invoices'][f]}"
                        elif f == "maxLo":
                            where_u += f"users.lo < {filter['Invoices'][f]}"
                        elif f == "reffer_login":
                            rid = conn.selectWhereStr(f"SELECT id FROM users WHERE username LIKE '%{str(filter['Invoices'][f])}%'")
                            if len(rid) > 0:
                                if len(rid) > 1:
                                    where_u += '('
                                for r in range(len(rid)):
                                    where_u += f"user_data.reffer_id = {rid[r][0]}"
                                    if r < len(rid) - 1:
                                        where_u += " or "
                                if len(rid) > 1:
                                    where_u += ')'
                        elif f == "first_name":
                            where_u += f"user_data.{f} LIKE '%{filter['Invoices'][f]}%'"
                        else:
                            if represents_number(filter['Invoices'][f]):
                                where_u += f"users.{f} = {filter['Invoices'][f]}"
                            else:
                                where_u += f"users.{f} LIKE '%{str(filter['Invoices'][f])}%'"
                                
                        if i < count_filter - 1:
                            where_u += " and "
                        i += 1
                        
                if where_u != "":
                    
                    where_u = f"WHERE {where_u}"
                    
                    usersids = conn.selectWhereStr(f"SELECT users.id FROM users INNER JOIN user_data ON users.id = user_data.user_id {where_u};")
                
                    print("userids")
                    print(usersids)
                
            
            
            if usersids:
                ii = 0
                newf = "("
                for uids in usersids:
                    newf += f"transactions.user_id = {uids[0]}"
                    if ii < len(usersids) - 1:
                        newf += " or "
                    ii += 1
                newf += ") and "
                
            if tx_filter:
                if tx_type == 0:
                    iii = 0
                    if newf == "":
                        newf = "("
                    else:
                        newf += "("
                    for txf in tx_filter:
                        newf += f"transactions.status = {txf}"
                        if iii < len(tx_filter) - 1:
                            newf += " or "
                        iii += 1
                    newf += ") and "
                else:
                    iii = 0
                    if newf == "":
                        newf = "("
                    else:
                        newf += "("
                    for txf in tx_filter:
                        newf += f"transactions.status = {txf}"
                        if iii < len(tx_filter) - 1:
                            newf += " or "
                        iii += 1
                    newf += ") and "
                    
            if buy_type_filter:
                if tx_type == 0:
                    iii = 0
                    if newf == "":
                        newf = "("
                    else:
                        newf += "("
                    for txf in buy_type_filter:
                        newf += f"transactions.buy_type = {txf}"
                        if iii < len(buy_type_filter) - 1:
                            newf += " or "
                        iii += 1
                    newf += ") and "
                    
            if initiator_id_filter:
                if tx_type > 0:
                    newf += f"transactions.initiator_id LIKE '%{str(initiator_id_filter[0])}%' and"
                    
            if package_id_filter:
                if tx_type == 0:
                    newf += f"transactions.package_id = {package_id_filter[0]} and"
                    
            if bonus_type_filter:
                if tx_type > 0:
                    iii = 0
                    if newf == "":
                        newf = "("
                    else:
                        newf += "("
                    for txf in bonus_type_filter:
                        newf += f"transactions.bonus_type = {txf}"
                        if iii < len(bonus_type_filter) - 1:
                            newf += " or "
                        iii += 1
                    newf += ") and "
                    
            if dateFrom_filter:
                newf += f"transactions.create_at >= '{dateFrom_filter[0]}' and "
                
            if dateTo_filter:
                newf += f"transactions.create_at <= '{dateTo_filter[0]}' and "
        
        ''' end filter '''
        
        str_tx_type = ""
        
        alls = None
        pay = None
        
        if filter == "":
            if tx_type == 0:
                str_tx_type = "transactions.type = 0"
                alls = conn.selectWhereStr(f"SELECT COUNT(amount) FROM transactions WHERE {str_tx_type};")
                pay = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type} and transactions.status = 3;")
            else:
                str_tx_type = "(transactions.type = 1 or transactions.type = 2 or transactions.type = 6)"
                alls = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type};")
                pay = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type} and transactions.status = 0;")
        else:
            if tx_type == 0:
                str_tx_type = "transactions.type = 0"
                alls = conn.selectWhereStr(f"SELECT COUNT(amount) FROM transactions WHERE {str_tx_type};")
                pay = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type} and transactions.status = 3;")
            else:
                str_tx_type = "(transactions.type = 1 or transactions.type = 2 or transactions.type = 6)"
                alls = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type};")
                pay = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type} and transactions.status = 0;")
                
        if alls[0][0]:
            alls = float(alls[0][0])
        else:
            alls = 0
        
        if pay[0][0]:
            pay = float(pay[0][0])
        else:
            pay = 0
            
        whait = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE {str_tx_type} and transactions.status = 3;")
        
        if whait[0][0]:
            whait = float(whait[0][0])
        else:
            whait = 0
        
        min_amount = conn.selectWhereStr(f"SELECT MIN(amount) FROM transactions WHERE {str_tx_type};")
        
        if min_amount[0][0]:
            min_amount = float(min_amount[0][0])
        else:
            min_amount = 0
        
        max_amount = conn.selectWhereStr(f"SELECT MAX(amount) FROM transactions WHERE {str_tx_type};")
        
        if max_amount[0][0]:
            max_amount = float(max_amount[0][0])
        else:
            max_amount = 0
            
        count = conn.selectWhereStr(f"SELECT COUNT(id) FROM transactions WHERE {str_tx_type};")
        
        if count[0][0]:
            count = count[0][0]
        else:
            count = 0
            
        ids = ""

        finances = conn.selectWhereStr(f"SELECT transactions.*, users.username, users.email, user_data.first_name FROM transactions INNER JOIN users ON transactions.user_id = users.id INNER JOIN user_data ON transactions.user_id = user_data.user_id WHERE {newf} {str_tx_type} ORDER BY transactions.id {sort} LIMIT {limit} OFFSET {offset};")
        column = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;")
        column2 = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' and (column_name = 'username' or column_name = 'email') ORDER BY ordinal_position;")
        column3 = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_data' and column_name = 'first_name' ORDER BY ordinal_position;")
        
        column.append(column2[0])
        column.append(column2[1])
        column.append(column3[0])
        
        current_price = conn.select("packages", "id", "1")
        current_price = current_price["result"]
        current_price = float(current_price.price)
        
        conn.disconnect()

        result = []

        for tr in finances:
            obj = {}
            for col in range(len(column)):
                row = tr[col]
                if str(type(row)) == "<class 'datetime.datetime'>":
                    nr = row + timedelta(hours=3)
                    row = str(nr).split(".")[0]
                elif str(type(row)) == "<class 'decimal.Decimal'>":
                    row = round(float(row), 2)
                
                if column[col][0] == "fixed":
                    row = tr[col + 1]
                
                # if column[col][0] == "status":
                #     row = statuses[row]
                # elif column[col][0] == "type":
                #     row = types[row]
                obj[column[col][0]] = row
            result.append(obj)
            
        buy_types = [
            "покупка акции",
            "покупка за сумму",
            "покупка пакета",
            "рассрочка",
            "акции в подарок"
        ]
            
        transactions = {"transactions": result, "min_amount": min_amount, "max_amount": max_amount, "count": count, "current_price": current_price, "bonus_types": bt, "buy_types": buy_types, "alls": round(alls, 2), "wait": round(whait, 2), "pay": round(pay, 2)}
        
        return json.dumps(transactions, cls=PersonEncoder)