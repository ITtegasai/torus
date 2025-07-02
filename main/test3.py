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
from marketing.bonuses import pay_bonuses, ps_bonuses
from marketing.qualifications import get_go, get_lb, get_lo, get_qualification_parthners, get_qualification_parthners_in_line, update_qual, update_qualifications
from pages import About, Bonuses, Cabinet, Finances, Invoices, News, Structure, Users

'''approve pay'''
conn = Connection()
user = conn.select("users", "username", "lusienka")
user = user["result"]

amountNew = 59150

print("pay_bonuses")
pay_bonuses(user, amountNew, user.username)
ps_bonuses(user, amountNew, user.username)
update_qualifications(user.id)