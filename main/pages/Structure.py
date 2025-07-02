import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from helpers.d2o import DictObj
from marketing.qualifications import extract_nested_keys, get_go, get_lb, get_lo

class Structure:
    def get(self, uid, tx_type = 0, limit = 10, offset = 0, filter = None):
        '''
        filter = {id}
        '''
        conn = Connection()
        
        u = uid
        
        if filter != None:
            fu = conn.select("users", "id", filter)
            u = fu["result"].uid
            
        i_user = conn.select("users", "uid", uid)
        i_user = i_user["result"]
            
        structure = conn.select("users", "uid", u, ["my_structure"])
        structure = structure["result"].my_structure
        structure = json.loads(structure)

        first_line = []

        for st in structure.keys():
            user = conn.select("users", "id", st)
            userData = conn.selectWhereString("SELECT * FROM user_data WHERE user_id = (SELECT id FROM users WHERE id = '{0}');".format(st))
            user = user["result"]
            userData = userData["result"]
            
            lou = get_lo(user.id)
            
            user.fix_price = float(user.fix_price)
            user.fix_amount = float(user.fix_amount)
            user.fix_all_amount = float(user.fix_all_amount)
            
            user.fix_price2 = float(user.fix_price2)
            user.fix_amount2 = float(user.fix_amount2)
            user.fix_all_amount2 = float(user.fix_all_amount2)
            
            user.lo = float(user.lo)
            
            user = json.loads(json.dumps(user, cls=PersonEncoder))
            user["lo"] = lou
            userData = json.loads(json.dumps(userData, cls=PersonEncoder))
            
            all = {"user": dict(json.loads(json.dumps(user, cls=PersonEncoder))), "userData": dict(json.loads(json.dumps(userData, cls=PersonEncoder)))}
            first_line.append(all)
        
        my_structure = json.loads(i_user.my_structure)
    
        lst = [int(x) for x in list(extract_nested_keys(my_structure))]
        
        count_users = len(lst)
        
        lo = get_lo(i_user.id)
        go = get_go(i_user.id)
        ls = get_lb(i_user.id)
        
        mydata = {"count_users": count_users, "lo": int(lo), "go": int(go), "ls": int(ls), "qualification": i_user.qualification}
        
        qualifications = [
            "",
            "Ассистент",
            "Агент",
            "Менеджер",
            "Партнер",
            "Управляющий",
            "Топ-менеджер",
            "Вице-президент"
        ]
        
        newObj = {"data": mydata, "users": first_line, "qualifications": qualifications}
        return json.dumps(newObj, cls=PersonEncoder)