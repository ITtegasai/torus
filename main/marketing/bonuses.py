import json
from datetime import datetime, timezone
import hashlib
from db.db import Connection

connection = Connection()
qualifications = connection.select("qualifications")
qualifications = qualifications["result"]
connection.disconnect()

def pay_bonuses(user, amount, initiator_id, line = 1):
    '''
    bonus_type - 0 - реферальный бонус, 1 - подключаемый бонус
    '''
    conn2 = Connection()
    ref_user_data = conn2.select("user_data", "user_id", user.id)
    if ref_user_data:
        ref_user_data = ref_user_data["result"]
        ref_users_line = conn2.select("users", "id", ref_user_data.reffer_id)
        if ref_users_line:
            if ref_users_line["result"].qualification:
                percents = json.loads(qualifications[ref_users_line["result"].qualification - 1].line_bonus)["lines"]
                percent = 0
                print(len(percents), ">=", line - 1)
                if len(percents) > line - 1:
                    percent = percents[line - 1]
                # if ref_users_line["result"].qualification >= line:
                    ts = datetime.now(timezone.utc)
        
                    m = hashlib.sha256()
                    m.update(bytes(ref_users_line["result"].uid + str(ts),'UTF-8'))
                    bonus_amount = amount / 100 * percent
                    tx_hash = m.hexdigest()
                    conn2.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "initiator_id", "bonus_type"], [tx_hash, 3, 2, ref_users_line["result"].id, ts, bonus_amount, 1, 0, initiator_id, 0])
                    conn2.disconnect()
            # if line < len(qualifications):
            pay_bonuses(ref_users_line["result"], amount, initiator_id, line + 1)
                    
def ps_bonuses(user, amount, initiator_id, line = 1):
    conn2 = Connection()

    is_bonus = conn2.select("packages", "id", "1")
    is_bonus = is_bonus["result"]
    is_bonus = is_bonus.bonus
    
    if is_bonus:
        ref_user_data = conn2.select("user_data", "user_id", user.id)
        ref_user_data = conn2.select("users", "id", ref_user_data["result"].reffer_id)
        if ref_user_data:
            ref_user_data = ref_user_data["result"]
            
            ref_user_data = conn2.select("users", "id", ref_user_data.id)
            ref_user_data = ref_user_data["result"]
            
            ts = datetime.now(timezone.utc)
                
            m = hashlib.sha256()
            m.update(bytes(ref_user_data.uid + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            bonus_amount = amount / 100 * 4
            conn2.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "initiator_id", "bonus_type"], [tx_hash, 3, 2, ref_user_data.id, ts, bonus_amount, 1, 0, initiator_id, 1])
            
            ref_user_data2 = conn2.select("user_data", "user_id", ref_user_data.id)
            ref_user_data2 = conn2.select("users", "id", ref_user_data2["result"].reffer_id)
            if ref_user_data2:
                ref_user_data2 = ref_user_data2["result"]
                
                ref_user_data2 = conn2.select("users", "id", ref_user_data2.id)
                ref_user_data2 = ref_user_data2["result"]
                
                ts2 = datetime.now(timezone.utc)
                
                m2 = hashlib.sha256()
                m2.update(bytes(ref_user_data2.uid + str(ts2),'UTF-8'))
                tx_hash2 = m2.hexdigest()
                
                bonus_amount2 = amount / 100 * 1
                conn2.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "initiator_id", "bonus_type"], [tx_hash2, 3, 2, ref_user_data2.id, ts2, bonus_amount2, 1, 0, initiator_id, 1])
            
    conn2.disconnect()