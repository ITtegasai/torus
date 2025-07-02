import json
from datetime import datetime, timezone, date
from dateutil.relativedelta import relativedelta
import hashlib
from db.db import Connection

'''
Партнер, Управляющий, Топ-менеджер, Вице-президент (4, 5, 6, 7)
Между ними 10 процентов

Управляющий, Топ-менеджер, Вице-президент (5, 6, 7)
Между ними 10 процентов

Топ-менеджер, Вице-президент (6, 7)
Между ними 10 процентов

Вице-президент (7)
Между ними 10 процентов
'''

# def get_lb_months(user_id):
#     conn2 = Connection()
#     refs = conn2.selectWhereStr(f"SELECT user_id FROM user_data WHERE reffer_id = {user_id};")
    
#     tsnow = datetime.now(timezone.utc) - relativedelta(months=1)
    
#     lb = 0
#     if refs:
#         refs = [int(x[0]) for x in refs]
        
#         string = ""
#         for l in range(len(refs)):
#             string += f"user_id = {refs[l]}"
#             if l < len(refs) - 1:
#                 string += " or "
#         lb = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE create_at >= '{tsnow.year}-{tsnow.month}-01' and status = 3 and type = 0 and ({string});")
#         if lb:
#             lb = int(lb[0][0])
#         else:
#             lb = 0
#     conn2.disconnect()
#     return lb

def get_lb_months(user_id):
    conn2 = Connection()
    refs = conn2.selectWhereStr(f"SELECT user_id FROM user_data WHERE reffer_id = {user_id};")
    
    tsn = date.fromisoformat('2025-07-01')
    tsnow = tsn - relativedelta(months=1)
    
    lb = 0
    if refs:
        refs = [int(x[0]) for x in refs]
        for l in range(len(refs)):
            plb = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE create_at >= '{tsnow.year}-{tsnow.month}-01' and status = 3 and type = 0 and user_id = {refs[l]};")
            if lb < int(plb[0][0]):
                lb = int(plb[0][0])
    conn2.disconnect()
    return lb

def pool_bonuses():
    conn = Connection()

    users_pool1 = conn.selectWhereStr("SELECT id FROM users WHERE qualification >= 4;")
    users_pool2 = conn.selectWhereStr("SELECT id FROM users WHERE qualification >= 5;")
    users_pool3 = conn.selectWhereStr("SELECT id FROM users WHERE qualification >= 6;")
    users_pool4 = conn.selectWhereStr("SELECT id FROM users WHERE qualification = 7;")

    users_count_pool1 = conn.selectWhereStr("SELECT COUNT(id) FROM users WHERE qualification >= 4;")[0][0]
    users_count_pool2 = conn.selectWhereStr("SELECT COUNT(id) FROM users WHERE qualification >= 5;")[0][0]
    users_count_pool3 = conn.selectWhereStr("SELECT COUNT(id) FROM users WHERE qualification >= 6;")[0][0]
    users_count_pool4 = conn.selectWhereStr("SELECT COUNT(id) FROM users WHERE qualification = 7;")[0][0]

    users = conn.selectWhereStr("SELECT id FROM users where qualification >= 4;")

    users_pool5 = []
    users_count_pool5 = 0

    users_pool6 = []
    users_count_pool6 = 0

    for u in users:
        lb = get_lb_months(u[0])
        if lb >= 10:
            users_pool5.append(u[0])
            users_count_pool5 += 1
        if lb >= 25:
            users_pool6.append(u[0])
            users_count_pool6 += 1
            
    users_pool7 = conn.selectWhereStr("SELECT id FROM users WHERE is_ambasador = true;")
    users_count_pool7 = conn.selectWhereStr("SELECT COUNT(id) FROM users WHERE is_ambasador = true;")[0][0]

    pools1234 = 0

    all_bonuses = conn.select("bonuses", "id", 1)
    all_bonuses = float(all_bonuses["result"].amount)

    if users_count_pool1 > 0:
        pool1 = (all_bonuses / 100 * 10) / users_count_pool1
        for up1 in users_pool1:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up1)[0] + "pool1" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up1[0], ts, pool1, 1, 0, 3])
    else:
        pools1234 += all_bonuses / 100 * 10
    if users_count_pool2 > 0:
        pool2 = (all_bonuses / 100 * 10) / users_count_pool2
        for up2 in users_pool2:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up2)[0] + "pool2" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up2[0], ts, pool2, 1, 0, 4])
    else:
        pools1234 += all_bonuses / 100 * 10
    if users_count_pool3 > 0:
        pool3 = (all_bonuses / 100 * 10) / users_count_pool3
        for up3 in users_pool3:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up3)[0] + "pool3" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up3[0], ts, pool3, 1, 0, 5])
    else:
        pools1234 += all_bonuses / 100 * 10
    if users_count_pool4 > 0:
        pool4 = (all_bonuses / 100 * 10) / users_count_pool4
        for up4 in users_pool4:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up4)[0] + "pool4" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up4[0], ts, pool4, 1, 0, 6])
    else:
        pools1234 += all_bonuses / 100 * 10

    if users_count_pool5 > 0:
        all_bonuses5 = conn.select("bonuses", "id", 2)
        all_bonuses5 = float(all_bonuses5["result"].amount)
        pool5 = (all_bonuses / 100 * 15) + all_bonuses5
        pool5 = pool5 / users_count_pool5
        for up5 in users_pool5:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up5) + "pool5" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up5, ts, pool5, 1, 0, 7])
        conn.updateFromStr("UPDATE bonuses SET amount = 0 WHERE id = 2;")
    else:
        pool5 = all_bonuses / 100 * 15
        conn.updateFromStr(f"UPDATE bonuses SET amount = amount + {pool5} WHERE id = 2;")

    if users_count_pool6 > 0:
        all_bonuses6 = conn.select("bonuses", "id", 3)
        all_bonuses6 = float(all_bonuses6["result"].amount)
        pool6 = (all_bonuses / 100 * 15) + all_bonuses6
        pool6 = pool6 / users_count_pool6
        for up6 in users_pool6:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up6) + "pool6" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up6, ts, pool6, 1, 0, 8])
        conn.updateFromStr("UPDATE bonuses SET amount = 0 WHERE id = 2;")
    else:
        pool6 = all_bonuses / 100 * 15
        conn.updateFromStr(f"UPDATE bonuses SET amount = amount + {pool6} WHERE id = 3;")

    if users_count_pool7 > 0:
        all_bonuses7 = conn.select("bonuses", "id", 4)
        all_bonuses7 = float(all_bonuses7["result"].amount)
        pool7 = (all_bonuses / 100 * 30) + all_bonuses7
        pool7 = pool7 / users_count_pool7
        for up7 in users_pool7:
            # ts = datetime.now(timezone.utc)
            ts = date.fromisoformat('2025-07-01')
            m = hashlib.sha256()
            m.update(bytes(str(up7[0]) + "pool7" + str(ts),'UTF-8'))
            tx_hash = m.hexdigest()
            
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type"], [tx_hash, 3, 2, up7[0], ts, pool7, 1, 0, 9])
        conn.updateFromStr("UPDATE bonuses SET amount = 0 WHERE id = 4;")
    else:
        pool7 = all_bonuses / 100 * 30
        conn.updateFromStr(f"UPDATE bonuses SET amount = amount + {pool7} WHERE id = 4;")

    conn.update("bonuses", ["amount"], [pools1234], 1)

    conn.disconnect()
    
# print(get_lb_months(57))
pool_bonuses()
# conn = Connection()

# users = conn.selectWhereStr("SELECT id, username FROM users;")

# users_pool5 = []
# users_count_pool5 = 0

# users_pool6 = []
# users_count_pool6 = 0

# for u in users:
#     lb = get_lb_months(u[0])
#     if lb >= 10:
#         users_pool5.append((u[0], u[1]))
#         users_count_pool5 += 1
#     if lb >= 25:
#         users_pool6.append((u[0], u[1]))
#         users_count_pool6 += 1

# print(users_pool5)
# print(users_count_pool5)
# print(users_pool6)
# print(users_count_pool6)

# conn.disconnect()