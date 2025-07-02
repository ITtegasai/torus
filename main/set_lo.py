from db.db import Connection
from marketing.qualifications import get_lo


conn = Connection()

users = conn.select("users")

conn.disconnect()

us = []

for u in users["result"]:
    lo = get_lo(u.id)
    us.append({"id": u.id, "lo": lo})
    
conn2 = Connection()

for u2 in us:
    conn2.update("users", ["lo"], [u2["lo"]], u2["id"])

conn2.disconnect()