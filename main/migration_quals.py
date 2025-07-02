import json
from db.db import Connection
from marketing.qualifications import update_qual

def update_qualifications():
    conn = Connection()
    qualifications = conn.select("qualifications")
    qualifications = qualifications["result"]
    qualifications.reverse()
    users = conn.select("users")
    conn.disconnect()
    
    arr = []
    for u in users["result"]:
        if u.structure:
            arr.append(int(u.id))
        
    arr.sort(reverse=True)
    
    print(arr)
    
    for ua in arr:
        update_qual(ua, qualifications, ua)
            
update_qualifications()