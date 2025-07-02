import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from helpers.d2o import DictObj
from marketing import bonus_types
from datetime import datetime, timedelta

class Bonuses:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = "amount >= 3000 and amount < 100001"
        '''
        
        bt = bonus_types.bonus_types()
        
        if limit == None:
            limit = 10
            
        if offset == None:
            offset = 0
        
        conn = Connection()
        statuses = ["created", "pending", "rejected", "confirmed"]
        types = ["payment", "withdrawal", "dividends"]
        
        new_filter = ""
        if filter:
            new_filter = "and " + filter
            
        str_tx_type = "and (type = 1 or type = 2 or type = 6)"
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
        
        in_waiting = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 0 and type = 6;")
        print(in_waiting)
        if in_waiting[0][0]:
            in_waiting = float(in_waiting[0][0])
        else:
            in_waiting = 0
        
        amount_received = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and (type = 1 or type = 2) and is_withdrawal = true and status = 3;")
        
        if amount_received[0][0]:
            amount_received = float(amount_received[0][0])
        else:
            amount_received = 0
        
        available_receipt = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and (type = 1 or type = 2) and is_withdrawal = false and (status = 3 or status = 2);")
        
        if available_receipt[0][0]:
            available_receipt = float(available_receipt[0][0])
        else:
            available_receipt = 0
            
        all_bonuses = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and (type = 1 or type = 2) and status = 3;")
        
        if all_bonuses[0][0]:
            all_bonuses = float(all_bonuses[0][0])
        else:
            all_bonuses = 0
        
        # rejected = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') and status = 2 {str_tx_type};")
        
        # if rejected[0][0]:
        #     rejected = float(rejected[0][0])
        # else:
        rejected = 0

        finances = conn.selectWhereStr(f"SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE uid = '{uid}') {new_filter} {str_tx_type} ORDER BY id DESC LIMIT {limit} OFFSET {offset};")
        column = conn.selectWhereStr("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;")
        

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
                
                if column[col][0] == "initiator_id" and column[col][0] != None:
                    obj[column[col][0]] = row
                # elif column[col][0] == "type":
                #     row = types[row]
                obj[column[col][0]] = row
            if obj["initiator_id"] != None:
                level = 0
                initiator = conn.select("users", "username", obj["initiator_id"])
                if initiator:
                    initiator = initiator["result"]
                    i = 1
                    structure_split = str(initiator.structure).split(" ")
                    structure_split.reverse()
                    for ss in structure_split:
                        if ss != None:
                            print(ss)
                            if int(obj["user_id"]) == int(ss):
                                level = i
                        i += 1
                obj["initiator_level"] = level
            result.append(obj)
            
        conn.disconnect()
        transactions = {"transactions": result, "min_amount": min_amount, "max_amount": max_amount, "count": count, "bonus_types": bt, "in_waiting": round(in_waiting, 2), "amount_received": round(amount_received, 2), "available_receipt": round(available_receipt, 2), "all_bonuses": round(all_bonuses, 2), "rejected": rejected}
        
        return json.dumps(transactions, cls=PersonEncoder)