from datetime import datetime, timezone, timedelta
import calendar
from dateutil.relativedelta import relativedelta
from hashlib import blake2b
import hashlib
import json
import math
import time
from db.db import Connection
from helpers.d2o import PersonEncoder
from marketing.qualifications import get_go, get_lb, get_lo, get_qualification_parthners, get_qualification_parthners_in_line, update_qual, update_qualifications
from marketing.bonuses import pay_bonuses, ps_bonuses
from pages import About, Bonuses, Cabinet, Finances, Invoices, News, Structure, Users



def send_receipt(mail: str, amount: str | None = None, count: str | None = None, package_id: str | None = None, type: int | None = None):
    '''
    type = 0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка
    '''
    
    amount = float(amount)
    
    if amount == 0:
        amount = None
    
    conn = Connection()
    
    user = conn.select("users", "email", mail)
    
    uid = user["result"].uid
    
    package = conn.select("packages", "id", package_id)
    
    tx = conn.select("transactions", "user_id", user["result"].id)
    
    if not tx and user["result"].role == 1:
        conn.update("users", ["role"], [2], user["result"].id)
        
    ts = datetime.now(timezone.utc)
    
    m = hashlib.shake_256(bytes(uid + str(ts),'UTF-8'))

    tx_hash = m.hexdigest(4)
    
    price = package["result"].price

    if user["result"].fix_price > 0: # and is_fixed_ts - date_now > 0:
        price = float(user["result"].fix_price)
    
    if not amount:
        amount = int(count) * price
        
    installment = False
    if type == 3:
        installment = True
        
    conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "installment", "buy_type"], [tx_hash, 0, 0, user["result"].id, ts, amount, package_id, price, installment, type])
    conn.updateFromStr("UPDATE texts SET dog_id = dog_id + 1;")
        
    return {"status": "ok", "hash": tx_hash}

def confirm_purchase(tx_hash: str):
    
    conn = Connection()
    
    status = 3
    
    transaction = conn.select("transactions", "tx_hash", tx_hash)
    
    user = conn.select("users", "id", transaction["result"].user_id)
    
    tsu = datetime.now(timezone.utc)
    
    conn.update("transactions", ["status", "update_at"], [status, tsu], transaction["result"].id)
    uids = []
    if transaction["result"].type == 0:
        if status == 3:
            uids.append(update_qualifications(user["result"].id))
            
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

        if is_fixed > 0: # and is_fixed_ts - date_now > 0:
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

def confirm_purchase_bonus(tx_hash: str):
    
    conn = Connection()
    
    status = 3
    
    transaction = conn.select("transactions", "tx_hash", tx_hash)
    
    user = conn.select("users", "id", transaction["result"].user_id)
    
    amountNew = transaction["result"].amount
    
    tsu = datetime.now(timezone.utc)
    
    conn.update("transactions", ["status", "update_at"], [status, tsu], transaction["result"].id)
    uids = []
    if transaction["result"].type == 0:
        if status == 3:
            print("pay_bonuses")
            pay_bonuses(user["result"], amountNew, user["result"].username)
            ps_bonuses(user["result"], amountNew, user["result"].username)
            uids.append(update_qualifications(user["result"].id))
            
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

        if is_fixed > 0: # and is_fixed_ts - date_now > 0:
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


arrusers = [["ilyaspaceman", 990000]]

for aui in arrusers:
    '''approve pay'''
    conn2 = Connection()
    user = conn2.select("users", "username", aui[0])
    user = user["result"]

    conn2.disconnect()

    # tx = send_receipt(mail=user.email, amount=aui[1], package_id=1, type=0)
    
    # print(tx)

    # confirm_purchase_bonus(tx["hash"])

    confirm_purchase(tx["hash"])

    qual = get_qualification_parthners_in_line(user.id)

    lo = get_lo(user.id)
    go = get_go(user.id)
    lb = get_lb(user.id)

    print("email:", user.email)
    print("логин:", user.username)
    print("квалификация:", user.qualification)
    print("ЛО:", lo)
    print("ГО", go)
    print("ЛП:", lb)
    print(qual)

    '''approve pay'''