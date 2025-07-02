from decimal import Decimal
import json
from db.db import Connection

def extract_nested_keys(d):
    for key in d.keys():
        yield key
        if isinstance(d[key], dict):
            yield from extract_nested_keys(d[key])
        

def get_lb(user_id):
    conn2 = Connection()
    refs = conn2.selectWhereStr(f"SELECT user_id FROM user_data WHERE reffer_id = {user_id};")
    lb = 0
    if refs:
        refs = [int(x[0]) for x in refs]
        
        string = ""
        for l in range(len(refs)):
            string += f"user_id = {refs[l]}"
            if l < len(refs) - 1:
                string += " or "
        lb = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE status = 3 and type = 0 and ({string});")
        if lb:
            lb = int(lb[0][0])
        else:
            lb = 0
    conn2.disconnect()
    return lb

def get_go(user_id):
    conn2 = Connection()
    user = conn2.select("users", "id", user_id)
    my_structure = json.loads(user["result"].my_structure)
    
    lst = [int(x) for x in list(extract_nested_keys(my_structure))]

    string = ""
    for l in range(len(lst)):
        string += f"user_id = {lst[l]}"
        if l < len(lst) - 1:
            string += " or "
            
    go = 0
    if string != "":
        go = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE status = 3 and type = 0 and ({string});")
    conn2.disconnect()
    if go:
        go = int(go[0][0])
    else:
        go = 0
    # go += get_lo(user_id)
    return go
    
# def get_lo(user_id):
#     conn2 = Connection()
#     lo = conn2.selectWhereStr(f"SELECT COALESCE(SUM(amount / COALESCE(NULLIF(price, 0), 1)), 0) FROM transactions WHERE user_id = {user_id} and status = 3 and type = 0;")
#     lo = int(lo[0][0])
#     conn2.disconnect()
#     return lo

def get_lo(user_id):
    conn2 = Connection()
    trb1 = conn2.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = {user_id} and type = 0 and status = 3 and package_id = 1 ORDER BY update_at ASC;")
    trb2 = conn2.selectWhereStr(f"SELECT amount, price FROM transactions WHERE user_id = {user_id} and type = 0 and status = 3 and package_id = 2 ORDER BY update_at ASC;")
    conn2.disconnect()

    balance1 = 0
    lo1 = 0
    for trbi1 in trb1:
        prev1 = int(Decimal(trbi1[0]) // Decimal(trbi1[1]))
        lo1 += int(Decimal(trbi1[0]) // Decimal(trbi1[1]))
        balance1 += Decimal(trbi1[0] - (Decimal(prev1) * Decimal(trbi1[1])))
        if Decimal(balance1) >= Decimal(trbi1[1]):
            lo1 += 1
            balance1 -= Decimal(trbi1[1])
            
    balance2 = 0
    lo2 = 0
    for trbi2 in trb2:
        prev2 = int(Decimal(trbi2[0]) // Decimal(trbi2[1]))
        lo2 += int(Decimal(trbi2[0]) // Decimal(trbi2[1]))
        balance2 += Decimal(trbi2[0] - (Decimal(prev2) * Decimal(trbi2[1])))
        if Decimal(balance2) >= Decimal(trbi2[1]):
            lo2 += 1
            balance2 -= Decimal(trbi2[1])
    balance = float(balance1 + balance2)
    balance = round(balance, 2)
    lo = lo1 + lo2
    return lo

def get_qualification_parthners_in_line(user_id):
    conn2 = Connection()
    user = conn2.select("users", "id", user_id)
    parthners_quals = []
    if user["result"].my_structure != "{}":
        my_structure = json.loads(user["result"].my_structure)
        quals = conn2.select("qualifications")
        i = 0
        for k in my_structure.keys():
            string = ""
            lst = [int(x) for x in list(extract_nested_keys({k: my_structure[k]}))]
            string = "WHERE "
            for l in range(len(lst)):
                string += f"id = {lst[l]}"
                if l < len(lst) - 1:
                    string += " or "

            parthners = conn2.selectWhereStr(f"SELECT id, qualification FROM users {string};")
            
            if parthners:
                parthners_quals.append({})
                for p in range(len(parthners)):
                    if parthners[p][1]:
                        if quals["result"][parthners[p][1] - 1].qualification in parthners_quals[i]:
                            parthners_quals[i][quals["result"][parthners[p][1] - 1].qualification] += 1
                        else:
                            # parthners_quals.append({quals["result"][parthners[p][1] - 1].qualification: 1})
                            parthners_quals[i][quals["result"][parthners[p][1] - 1].qualification] = 1
                    else:
                        if "no_qualification" in parthners_quals[i]:
                            parthners_quals[i]["no_qualification"] += 1
                        else:
                            # parthners_quals.append({"no_qualification": 1})
                            parthners_quals[i]["no_qualification"] = 1
            i += 1
            
    conn2.disconnect()
    
    
    parthners_quals_in_line = {}
    
    for pq in parthners_quals:
        new_dict = {
            "top_manager": 0,
            "governing": 0,
            "parthner": 0,
            "assistent": 0,
            "president": 0,
            "manager": 0,
            "agent": 0,
            "no_qualification": 0
        }
        
        
        
        for nd in pq.keys():
            new_dict[nd] += pq[nd]
            
        nn_dict = {}
    
        for nnd in new_dict.keys():
            if new_dict[nnd] > 0:
                nn_dict[nnd] = new_dict[nnd]
        
        # qualification_parthners = nn_dict
            
        # print("++++++++++++++++++++++")
        # print(list(nn_dict.keys())[0])
        # print("++++++++++++++++++++++")
        
        # for key in pq.keys():
        if list(nn_dict.keys())[0] in parthners_quals_in_line:
            parthners_quals_in_line[list(nn_dict.keys())[0]] += 1
        else:
            parthners_quals_in_line[list(nn_dict.keys())[0]] = 1
                
    return parthners_quals_in_line

def get_qualification_parthners(user_id):
    conn2 = Connection()
    user = conn2.select("users", "id", user_id)
    string = ""
    if user["result"].my_structure != "{}":
        my_structure = json.loads(user["result"].my_structure)
        lst = [int(x) for x in list(extract_nested_keys(my_structure))]
        string = "WHERE "
        for l in range(len(lst)):
            string += f"id = {lst[l]}"
            if l < len(lst) - 1:
                string += " or "

    parthners = conn2.selectWhereStr(f"SELECT id, qualification FROM users {string};")
    
    quals = conn2.select("qualifications")
    
    parthners_quals = {}
    
    if parthners:
        for p in range(len(parthners)):
            if parthners[p][1]:
                if quals["result"][parthners[p][1] - 1].qualification in parthners_quals:
                    parthners_quals[quals["result"][parthners[p][1] - 1].qualification] += 1
                else:
                    parthners_quals[quals["result"][parthners[p][1] - 1].qualification] = 1
            else:
                if "no_qualification" in parthners_quals:
                    parthners_quals["no_qualification"] += 1
                else:
                    parthners_quals["no_qualification"] = 1
    
    conn2.disconnect()
    
    return parthners_quals

def update_qual(user_id, qualifications, x):
    conn2 = Connection()
    user_id = int(x)
    print(user_id)
    ref = conn2.select("users", "id", user_id)
    ref = ref["result"]
    uid = ref.uid
    
    lb = get_lb(user_id)
    lo = get_lo(user_id)
    go = get_go(user_id)
    
    qualification_parthners = get_qualification_parthners_in_line(user_id)
    
    print(lb)
    print(lo)
    print(go)
    print(qualification_parthners)
    
    nqp = {}
    
    pred_q = 0
    i = 0
    
    new_dict = {
        "top_manager": 0,
        "governing": 0,
        "parthner": 0,
        "assistent": 0,
        "president": 0,
        "manager": 0,
        "agent": 0,
        "no_qualification": 0
    }
    
    for nd in qualification_parthners.keys():
        new_dict[nd] += qualification_parthners[nd]
    
    nn_dict = {}
    
    for nnd in new_dict.keys():
        if new_dict[nnd] > 0:
            nn_dict[nnd] = new_dict[nnd]
    
    qualification_parthners = nn_dict
    
    for qpk in qualification_parthners.keys():
        if i > 0:
            nqp[qpk] = qualification_parthners[qpk] + pred_q
        else:
            nqp[qpk] = qualification_parthners[qpk]
        pred_q += qualification_parthners[qpk]
        i += 1
        
    qualification_parthners = nqp
    
    next_qual_status = False
    
    for nq in qualifications:
        print("nq.id", nq.id)
        if int(lo) >= int(nq.lo) and int(lb) >= int(nq.lb) and int(go) >= int(nq.go):
            if nq.parthners == '{}':
                next_qual_status = True
            else:
                for p in json.loads(nq.parthners)["parthner"]:
                    for i in range(len(qualifications) - p["pid"] + 1):
                        if qualifications[i].qualification in qualification_parthners:
                            if qualification_parthners[qualifications[i].qualification] >= p["count"]:
                                next_qual_status = True
                            else:
                                if nq.or_in != "null":
                                    for kv in range(len(json.loads(nq.or_in))):
                                        or_in_key = list(json.loads(nq.or_in).keys())[kv]
                                        or_in_val = list(json.loads(nq.or_in).values())[kv]
                                        diction = {"lb": lb, "lo": lo, "go": go, "qualification_parthners": qualification_parthners}
                                        
                                        if diction[or_in_key] >= or_in_val:
                                            next_qual_status = True
        else:
            if nq.or_in != "null":
                for kv in range(len(json.loads(nq.or_in))):
                    or_in_key = list(json.loads(nq.or_in).keys())[kv]
                    or_in_val = list(json.loads(nq.or_in).values())[kv]
                    diction = {"lb": lb, "lo": lo, "go": go, "qualification_parthners": qualification_parthners}
                    
                    if diction[or_in_key] >= or_in_val:
                        next_qual_status = True
                        
        if next_qual_status:
            print(user_id)
            print("now", ref.qualification)
            print("next", nq.id)
            conn2.update("users", ["qualification"], [nq.id], user_id)
            break
        
    conn2.disconnect()
    return uid

def update_qualifications(user_id):
    conn2 = Connection()
    qualifications = conn2.select("qualifications")
    qualifications = qualifications["result"]
    qualifications.reverse()
    user = conn2.select("users", "id", user_id)
    conn2.disconnect()
    uids = []
    if user["result"].structure:
        uids.append(update_qual(user_id, qualifications, user_id))
        struct_split = user["result"].structure.split()
        struct_split.reverse()
        print(struct_split)
        for x in struct_split:
            uids.append(update_qual(user_id, qualifications, x))
            
    return uids