import json
import importlib

'''
data_ws: {
    "data": [
        {
            "Class": 
                {params}
        }
    ]
}

{"data": {"page": "Finances", "tx_type": 0, "limit": 10, "offset": 0}}

{"data": {"page": "Structure"}}

func_creator('{"data": {"page": "User", "tx_type": 0, "limit": 10, "offset": 2}}')
'''

def func_creator(uid, data_ws):
    if not data_ws:
        data_ws = '{"data": {}}'
    data_ws_json = json.loads(data_ws)

    message = {}

    func_name = data_ws_json["data"]["page"]
    limit = 10
    offset = 0
    tx_type = 0
    filter = None


    if "limit" in data_ws_json["data"]:
        limit = data_ws_json["data"]["limit"]
    if "offset" in data_ws_json["data"]:
        offset = data_ws_json["data"]["offset"]
    if "tx_type" in data_ws_json["data"]:
        tx_type = data_ws_json["data"]["tx_type"]
    if "filter" in data_ws_json["data"]:
        filter = data_ws_json["data"]["filter"]

    try:
        m = importlib.import_module("pages." + func_name)
        c = getattr(m, func_name)
        clss = c()
        data_class = clss.get(uid, tx_type, limit, offset, filter)
        if data_class:
            message[func_name] = json.loads(data_class)
    except ImportError as ie:
        print(ie)
    except AttributeError as ae:
        print(ae)
    print(message)
    return message
