import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from helpers.d2o import DictObj
from marketing import bonus_types
from datetime import datetime, timedelta

class Finances:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = "amount >= 3000 and amount < 100001"
        '''
        
        bt = bonus_types.bonus_types()
        
        conn = Connection()
        statuses = ["created", "pending", "rejected", "confirmed"]
        types = ["payment", "withdrawal", "dividends"]
        
        new_filter = ""
        if filter:
            new_filter = "and " + filter
            
        str_tx_type = "and type = 0"
        # if tx_type > 0:
        #     str_tx_type = "and type > 0"
            
        min_amount = conn.selectWhereStr(f"SELECT MIN(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') {str_tx_type};")
        
        if min_amount[0][0]:
            min_amount = float(min_amount[0][0])
        else:
            min_amount = 0
        
        max_amount = conn.selectWhereStr(f"SELECT MAX(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') {str_tx_type};")
        
        if max_amount[0][0]:
            max_amount = float(max_amount[0][0])
        else:
            max_amount = 0
            
        count = conn.selectWhereStr(f"SELECT COUNT(id) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') {new_filter} {str_tx_type};")
        
        if count[0][0]:
            count = count[0][0]
        else:
            count = 0
            
        # 0 - created, 1 - pending, 2 - rejected, 3 - confirmed
        
        in_waiting = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 1 {str_tx_type};")
        
        if in_waiting[0][0]:
            in_waiting = float(in_waiting[0][0])
        else:
            in_waiting = 0
        
        amount_received = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 3 {str_tx_type};")
        
        if amount_received[0][0]:
            amount_received = float(amount_received[0][0])
        else:
            amount_received = 0
        
        available_receipt = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 0 {str_tx_type};")
        
        if available_receipt[0][0]:
            available_receipt = float(available_receipt[0][0])
        else:
            available_receipt = 0
        
        rejected = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 2 {str_tx_type};")
        
        if rejected[0][0]:
            rejected = float(rejected[0][0])
        else:
            rejected = 0

        finances = conn.selectWhereStr(f"SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') {new_filter} {str_tx_type} ORDER BY id DESC LIMIT {limit} OFFSET {offset};")
        column = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;")
        
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
                    row = float(row)
                
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
            
        transactions = {"transactions": result, "min_amount": min_amount, "max_amount": max_amount, "count": count, "current_price": current_price, "bonus_types": bt, "in_waiting": in_waiting, "amount_received": amount_received, "available_receipt": available_receipt, "rejected": rejected, "buy_types": buy_types}
        
        return json.dumps(transactions, cls=PersonEncoder)