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

'''approve pay'''
conn2 = Connection()

tx = conn2.selectWhereStr(f"select * from transactions where (type = 0) and status = 3 and user_id = (select id from users where username = 'dimas') ORDER BY id ASC;")

balance1 = 0.0
balance2 = 0.0
count = 0

for t in tx:
    if t[9] == 1:
        balance1 += float(t[8])
        prev = int(balance1 // float(t[10]))
        count += prev
        balance1 = balance1 - (prev * float(t[10]))
    elif t[9] == 2:
        balance2 += float(t[8])
        prev = int(balance2 // float(t[10]))
        count += prev
        balance2 = balance2 - (prev * float(t[10]))

balance1 = round(balance1, 2)
balance2 = round(balance2, 2)

print(balance1)
print(balance2)
print(count)

conn2.disconnect()

'''approve pay'''