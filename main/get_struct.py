import json
from db.db import Connection
from helpers.d2o import PersonEncoder
from helpers.d2o import DictObj
from marketing.qualifications import extract_nested_keys, get_go, get_lb, get_lo

csv = f'username;level;\n'

def us_in_line(dc, line):
    stru = []
    for st in dc.keys():
        user = conn.select("users", "id", st, ["username"])
        user = user["result"]
        stru.append([user.username, line])
        sss = us_in_line(dc[st], line + 1)
        if sss:
            for s in sss:
                stru.append([s[0], s[1]])
    return stru

u = 'cribaks'

conn = Connection()

structure = conn.select("users", "username", u, ["my_structure"])
structure = structure["result"].my_structure
structure = json.loads(structure)


ssss = us_in_line(structure, 1)

conn.disconnect()

for sssss in ssss:
    csv += f'{sssss[0]};{sssss[1]};\n'
    
print(csv)