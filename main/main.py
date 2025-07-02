import base64
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
import hashlib
import json
import math
import os
import time
from typing import Union
from num2words import num2words
import pdfkit

from fastapi import Depends, File, Request, FastAPI, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse

from dotenv import load_dotenv
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from fastapi.websockets import WebSocketState
import websockets

from db.db import Connection
from helpers import func_creator
from lib.jwt import verify_jwt_token
from marketing.bonuses import pay_bonuses, ps_bonuses
from marketing.qualifications import update_qualifications
from marketing.manual_bonus import send_receiptb, confirm_purchase_bonus, confirm_purchase_no_bonus
import re

load_dotenv()

app = FastAPI(title='TFG main service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = Connection()
conn.updateFromStr("UPDATE users set is_online = false WHERE is_online=true;")
conn.disconnect()

def parse_timestamp(timestamp):
  return datetime(*[int(x) for x in re.findall(r'\d+', timestamp)])

def generate_html_response(client_jwt):
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket</title>
        </head>
        <body>
            <h1>WebSocket</h1>
            <form action="" onsubmit="sendMessage(event)">
                <input type="text" id="messageText" autocomplete="off"/>
                <button>Send</button>
            </form>
            <ul id='messages'>
            </ul>
            <script>
                var ws = new WebSocket("wss://main.srws.ru/ws/%s");
                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages')
                    var message = document.createElement('li')
                    var content = document.createTextNode(event.data)
                    message.appendChild(content)
                    messages.appendChild(message)
                };
                function sendMessage(event) {
                    var input = document.getElementById("messageText")
                    ws.send(input.value)
                    input.value = ''
                    event.preventDefault()
                }
            </script>
        </body>
    </html>
    """ % (client_jwt)
    #html.replace("{client_jwt}", client_jwt)
    return HTMLResponse(content=html, status_code=200)

def generate_html_response_admin(client_jwt):
    admin = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket</title>
        </head>
        <body>
            <h1>WebSocket</h1>
            <form action="" onsubmit="sendMessage(event)">
                <input type="text" id="messageText" autocomplete="off"/>
                <button>Send</button>
            </form>
            <ul id='messages'>
            </ul>
            <script>
                var ws = new WebSocket("wss://main.srws.ru/ws/admin/%s");
                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages')
                    var message = document.createElement('li')
                    var content = document.createTextNode(event.data)
                    message.appendChild(content)
                    messages.appendChild(message)
                };
                function sendMessage(event) {
                    var input = document.getElementById("messageText")
                    ws.send(input.value)
                    input.value = '{"data": {"page": "Users"}}'
                    event.preventDefault()
                }
            </script>
        </body>
    </html>
    """ % (client_jwt)
    #admin.replace("{client_jwt}", client_jwt)
    return HTMLResponse(content=admin, status_code=200)

@app.get("/test/user")
async def get(client_jwt):
    return generate_html_response(client_jwt)

@app.get("/test/admin")
async def get(client_jwt):
    return generate_html_response_admin(client_jwt)

clients = {}


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket, uid, role):
        await websocket.accept()
        if uid not in clients:
            clients[uid] = []
        clients[uid].append([websocket, role])
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, uid):
        print("websocket close")
        if uid in clients:
            for ws in clients[uid]:
                if ws[0] == websocket:
                    if len(clients[uid]) > 1:
                        clients[uid].remove(ws)
                    else:
                        clients.pop(uid)
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_admin_message(self, message: str):
        for key in clients:
            for v in clients[key]:
                if v[1] >= 3:
                    if v[0].client_state == WebSocketState.CONNECTED:
                        await v[0].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_jwt}")
async def websocket_endpoint(websocket: WebSocket, client_jwt: str):
    decoded_data = verify_jwt_token(client_jwt)
    if not decoded_data:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    uid = decoded_data["sub"]
    conn = Connection()
    user = conn.select("users", "uid", uid)
    if not user:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    user = user["result"]
    await manager.connect(websocket, uid, user.role)
    
    conn.update("users", ["is_online"], [True], user.id)
    # await manager.send_admin_message("update")
    conn.disconnect()
    try:
        while True:
            data_ws = await websocket.receive_text()

            message = func_creator.func_creator(uid, data_ws)

            message["message"] = json.loads(data_ws)

            #print(message)

            # for ws in clients[uid]:
            #     if len(ws) > 0:
            await manager.send_personal_message(json.dumps(message), websocket)
        
    except BaseException as exc:
        print(exc)
        # conn = Connection()
        # conn.update("users", ["is_online"], [False], user.id)
        # conn.disconnect()
        # manager.disconnect(websocket, uid)
        # await manager.send_admin_message("update")
    
    except WebSocketDisconnect():
        conn = Connection()
        conn.update("users", ["is_online"], [False], user.id)
        conn.disconnect()
        manager.disconnect(websocket, uid)
        # await manager.send_admin_message("update")

@app.websocket("/ws/admin/{client_jwt}")
async def websocket_endpoint_admin(websocket: WebSocket, client_jwt: str):
    decoded_data = verify_jwt_token(client_jwt)
    if not decoded_data:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    uid = decoded_data["sub"]
    conn = Connection()
    user = conn.select("users", "uid", uid)
    if not user:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    user = user["result"]

    print(user.role)
    if int(user.role) < 3:
        print(int(user.role))
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    
    await manager.connect(websocket, uid, user.role)
    
    conn.update("users", ["is_online"], [True], user.id)
    # await manager.send_admin_message("update")
    conn.disconnect()
    try:
        while True:
            data_ws = await websocket.receive_text()
            
            print(data_ws)

            message = func_creator.func_creator(uid, data_ws)

            message["message"] = json.loads(data_ws)
            
            print(message["message"])
            
            # data_ws_json = json.loads(data_ws)
            
            # if "uids" in data_ws_json["data"]:
            #     data_ws_json = data_ws_json["data"]["uids"]

            #     for ws in data_ws_json:
            #         if ws in clients:
            #             for ws2 in clients[uid]:
            #                 if len(ws2) > 0:
            #                     await manager.send_personal_message("update", ws2[0])
            # else:
            # for ws in clients[uid]:
            #     if len(ws) > 0:
            await manager.send_personal_message(json.dumps(message), websocket)
        
    except BaseException as exc:
        print(exc)
        # conn = Connection()
        # conn.update("users", ["is_online"], [False], user.id)
        # conn.disconnect()
        # manager.disconnect(websocket, uid)
        # await manager.send_admin_message("update")
    
    except WebSocketDisconnect():
        conn = Connection()
        conn.update("users", ["is_online"], [False], user.id)
        conn.disconnect()
        manager.disconnect(websocket, uid)
        # await manager.send_admin_message("update")
        
@app.websocket("/ws/update/{uid}/{page}")
async def websocket_endpoint_update(websocket: WebSocket, uid: str, page: str):
    await manager.connect(websocket, "uid_updater", 0)
    msg = "update"
    # if page != "update":
    #     msg = '{"data": {"page": "' + page + '"}}'
    try:
        await websocket.receive_text()
        if uid in clients:
            for v in clients[uid]:
                print(uid, v[0].client_state)
                if v[0].client_state == WebSocketState.CONNECTED:
                    # message = func_creator.func_creator(uid, msg)

                    # message["message"] = json.loads(msg)
                    try:
                        await manager.send_personal_message("update", v[0])
                    except Exception as e:
                        continue
        for k in clients.keys():
            for v in clients[k]:
                if v[1] >= 3:
                    print(uid, v[0].client_state)
                    if v[0].client_state == WebSocketState.CONNECTED:
                        try:
                            await manager.send_personal_message("update", v[0])
                        except Exception as e:
                            continue
        # await manager.send_admin_message("update")
    except BaseException as exc:
        print(exc)
    
    except WebSocketDisconnect():
        manager.disconnect(websocket, "uid_updater")


header_scheme = APIKeyHeader(name="x-service-auth-key")

def check(key):
    if key != os.getenv("MESSAGE_SERVICE_KEY_TOKEN"):
        raise HTTPException(status_code=500, detail="invalid x-service-auth-key")
    
app.mount("/images", StaticFiles(directory="images"), name="images")

@app.post("/updateuserdata")
async def update_userdata(request: Request, key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    update user data
    {
        "access_token": "...",
        "table": "users" || "user_data",
        "data": {
            "key": "value"
        }
    }
    '''

    if "access_token" not in obj:
        raise HTTPException(status_code=400, detail="error data")

    decoded_data = verify_jwt_token(obj["access_token"])
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]

    if "table" not in obj and "data" not in obj:
        raise HTTPException(status_code=400, detail="error data")

    conn = Connection()
    
    keys = list(obj["data"].keys())
    values = list(obj["data"].values())
    
    user = conn.select("users", "uid", uid)
    user = user["result"]
    
    if obj["table"] != "users":
        user = conn.select(obj["table"], "user_id", user.id)
        user = user["result"]
        
    if not user:
        raise HTTPException(status_code=400, detail="error data")

    conn.update(obj["table"], keys, values, user.id)
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/updateuserdataadmin")
async def update_userdata(request: Request, key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    update user data
    {
        "access_token": "...",
        "table": "users" || "user_data",
        "uid": "uid",
        "data": {
            "key": "value"
        }
    }
    '''

    if "access_token" not in obj:
        raise HTTPException(status_code=400, detail="error data")

    decoded_data = verify_jwt_token(obj["access_token"])
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]

    if "table" not in obj and "data" not in obj and "uid" not in obj:
        raise HTTPException(status_code=400, detail="error data")

    conn = Connection()
    
    keys = list(obj["data"].keys())
    values = list(obj["data"].values())
    
    if "email" in obj["data"]:
        email = obj["data"]["email"]
        email = conn.select("users", "email", email)
        if email:
            raise HTTPException(status_code=400, detail="email already exists")
    
    admin = conn.select("users", "uid", uid)
    admin = admin["result"]
    
    if admin.role < 3:
        conn.disconnect()
        raise HTTPException(status_code=403, detail="access is denied")
      
    user = conn.select("users", "uid", obj["uid"])
    user = user["result"]
    if not user:
        raise HTTPException(status_code=400, detail="error data")

    conn.update(obj["table"], keys, values, user.id)
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}
    
@app.post("/updateimage/{access_token}")
async def update_image(request: Request, access_token: str, key: str = Depends(header_scheme), image: UploadFile | None = None):

    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    if image:
        print(image)
        try:
            contents = image.file.read()
            with open("images/" + uid + ".jpg", 'wb') as f:
                f.write(contents)
        except Exception:
            print("There was an error uploading the file")
        finally:
            image.file.close()
            
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
    
    return {"status": "ok"}
        
@app.post("/getverificationimages/{access_token}")
def get_verification_images(access_token: str, key: str = Depends(header_scheme)):

    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    user = conn.select("users", "uid", uid)
    conn.disconnect()
    
    # if user["result"].role < 3:
    #     raise HTTPException(status_code=403, detail="access is denied")
    
    path_passport = "vimages/" + uid + "_passport.jpg"
    path_selfie = "vimages/" + uid + "_selfie.jpg"
    
    path = []
    
    if os.path.exists(path_passport):
        with open(path_passport, "rb") as passport:
            passport_string = base64.b64encode(passport.read())
            path.append({"filename": uid + "_passport.jpg", "filedata": passport_string})
    if os.path.exists(path_selfie):
        with open(path_selfie, "rb") as selfie:
            selfie_string = base64.b64encode(selfie.read())
            path.append({"filename": uid + "_selfie.jpg", "filedata": selfie_string})
        
    if len(path) > 0:
        return path
    else:
        return None 
    
@app.post("/getverificationimagesuser/{access_token}")
def get_verification_images(access_token: str, key: str = Depends(header_scheme), type: int = 0, uid: str | None = None):

    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uida = decoded_data["sub"]
    
    conn = Connection()
    user = conn.select("users", "uid", uida)
    conn.disconnect()
    
    if user["result"].role < 3:
        raise HTTPException(status_code=403, detail="access is denied")
    
    
    if type == 0:
        path_passport = "vimages/" + uid + "_passport.jpg"
        if os.path.exists(path_passport):
            with open(path_passport, "rb") as passport:
                passport_string = base64.b64encode(passport.read())
                return {"filename": uid + "_passport.jpg", "filedata": passport_string}
        else:
            return None
    else:
        path_selfie = "vimages/" + uid + "_selfie.jpg"
        if os.path.exists(path_selfie):
            with open(path_selfie, "rb") as selfie:
                selfie_string = base64.b64encode(selfie.read())
                return {"filename": uid + "_selfie.jpg", "filedata": selfie_string}
        else:
            return None
            
@app.post("/uploadverificationimages/{access_token}")
async def upload_verification_images(request: Request, access_token: str, key: str = Depends(header_scheme), passport: UploadFile | None = None, selfie: UploadFile | None = None):

    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    if passport:
        print(passport)
        try:
            contents = passport.file.read()
            with open("vimages/" + uid + "_passport.jpg", 'wb') as f:
                f.write(contents)
        except Exception:
            print("There was an error uploading the passport")
        finally:
            passport.file.close()
            
    if selfie:
        print(selfie)
        try:
            contents = selfie.file.read()
            with open("vimages/" + uid + "_selfie.jpg", 'wb') as f:
                f.write(contents)
        except Exception:
            print("There was an error uploading the selfie")
        finally:
            selfie.file.close()
            
    conn = Connection()
    user = conn.select("users", "uid", uid)
    user = user["result"]
    conn.update("users", ["rejected_verification_message", "pending_verification"], ["1", True], user.id)
    conn.disconnect()
            
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}
        
@app.post("/getreceipt/{access_token}")
def get_receipts(access_token: str, key: str = Depends(header_scheme), tx_hash: str | None = None):

    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    user = conn.select("users", "uid", uid)
    conn.disconnect()
    
    if user["result"].role < 3:
        raise HTTPException(status_code=403, detail="access is denied")
    
    path = {"files": ""}
    
     
    for file in os.listdir("receipt"):
        if file.startswith(tx_hash):
            with open("receipt/" + file, "rb") as receipt:
                receipt_string = base64.b64encode(receipt.read())
                path["files"] = {"filename": file, "filedata": receipt_string}
    
    print("-----------------path-------------------")
    print(path)
    print("-----------------path-------------------")
    
    if len(path) > 0:
        return path
    else:
        return None
    
@app.post("/buy/{access_token}")
async def send_receipt(request: Request, access_token: str, key: str = Depends(header_scheme), amount: str | None = None, count: str | None = None, package_id: str | None = None, type: int | None = None):
    '''
    type = 0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка
    '''
    
    amount = float(amount)
    
    if amount == 0:
        amount = None
    
    if not (amount or count) and not package_id:
        raise HTTPException(status_code=400, detail="error data")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    package = conn.select("packages", "id", package_id)
    
    if not package:
        raise HTTPException(status_code=400, detail="package not found")
    
    user = conn.select("users", "uid", uid)
    
    is_tr = conn.selectWhereString(f"SELECT * FROM transactions WHERE user_id = {user['result'].id} and type = 0 and (status = 0 or status = 1) and package_id = {package_id};")

    if is_tr["result"]:
        raise HTTPException(status_code=408, detail="the transaction has already been created")
    
    if user["result"].role == 0:
        raise HTTPException(status_code=403, detail="verification is required")
    
    
    tx = conn.select("transactions", "user_id", user["result"].id)
    
    if not tx and user["result"].role == 1:
        conn.update("users", ["role"], [2], user["result"].id)
        
    ts = datetime.now(timezone.utc)
    
    m = hashlib.shake_256(bytes(uid + str(ts),'UTF-8'))

    tx_hash = m.hexdigest(4)
    
    if not amount:
        amount = int(count) * float(package["result"].price)
        
    doc = conn.select("texts", "const", f"dogovor{str(type)}")
    dog_id = doc["result"].dog_id
    dog_id += 1
    installment = False
    price_new = package["result"].price
    if type == 3:
        if int(package_id) == 1:
            if user["result"].fix_price == 0 and user["result"].fix_timestamp == None and user["result"].fix_months == 0:
                conn.update("users", ["fix_price", "fix_amount", "fix_all_amount", "fix_months"], [package["result"].price, amount, amount, 12], user["result"].id)
        elif int(package_id) == 2:
            if user["result"].fix_price2 == 0 and user["result"].fix_timestamp2 == None and user["result"].fix_months2 == 0:
                conn.update("users", ["fix_price2", "fix_amount2", "fix_all_amount2", "fix_months2"], [package["result"].price, amount, amount, 12], user["result"].id)
                
    conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "installment", "buy_type", "dog_id"], [tx_hash, 0, 0, user["result"].id, ts, amount, package_id, price_new, installment, type, dog_id])
        
    conn.updateFromStr("UPDATE texts SET dog_id = dog_id + 1;")
    
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok", "hash": tx_hash}

@app.post("/cancelinvoice/{access_token}")
async def cancel_invoice(request: Request, access_token: str, key: str = Depends(header_scheme), tx_hash: str | None = None):

    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")
    
    if not tx_hash:
        raise HTTPException(status_code=400, detail="tx hash is not specified")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    user = conn.select("users", "uid", uid)
    
    tx = conn.selectWhereString(f"SELECT * FROM transactions WHERE tx_hash = '{tx_hash}' and user_id = {user['result'].id};")
    
    if not tx:
        raise HTTPException(status_code=400, detail="tx the hash was not found for this user")
    
    ts = datetime.now(timezone.utc)
        
    conn.update("transactions", ["status", "update_at"], [2, ts], tx["result"].id)
    
    conn.disconnect()
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok", "hash": tx_hash}

@app.post("/withdraw/{access_token}")
async def withdraw(request: Request, access_token: str, key: str = Depends(header_scheme), typewd: int | None = None):
    '''
    typewd = 0 - вывод, 1 - реинвест
    '''
    typewdn = 0
    
    if typewd:
        typewdn = typewdn
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    user = conn.select("users", "uid", uid)
    user = user["result"]
    
    bonuses = conn.selectWhereString(f"SELECT * FROM transactions WHERE user_id = {user.id} and type = 2 and (status = 3 or status = 2) and is_withdrawal = false")
    
    if not bonuses:
        raise HTTPException(status_code=400, detail="there are no bonuses available for withdrawal")
    
    bonuses = bonuses["result"]
    
    amount = 0
    if type(bonuses) == list:
        for b in bonuses:
            conn.update("transactions", ["is_withdrawal"], [True], b.id)
            amount += float(b.amount)
    else:
        conn.update("transactions", ["is_withdrawal"], [True], bonuses.id)
        amount += float(bonuses.amount)

    if amount == 0:
        raise HTTPException(status_code=400, detail="there are no bonuses available for withdrawal")

    ts = datetime.now(timezone.utc)
        
    m = hashlib.shake_256(bytes(user.uid + str(ts),'UTF-8'))

    tx_hash = m.hexdigest(4)
        
    conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "bonus_type", "dog_id"], [tx_hash, 0, 6, user.id, ts, amount, 1, 0, 2, 0])
    
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok", "hash": tx_hash}

''' withdraw '''

@app.post("/confirmwithdraw/{access_token}")
async def confirm_withdraw(request: Request, access_token: str, key: str = Depends(header_scheme), tx_hash: str | None = None, status: int | None = None):
    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    admin = conn.select("users", "uid", uid)
    
    if status < 2 or status > 3:
        raise HTTPException(status_code=400, detail="status only 3 - accept or 2 - decline")
    
    if not admin:
        raise HTTPException(status_code=403, detail="access denied")
    
    if admin["result"].role < 3:
        raise HTTPException(status_code=403, detail="access denied")
    
    transaction = conn.select("transactions", "tx_hash", tx_hash)
    
    if transaction["result"].type != 6:
        raise HTTPException(status_code=403, detail="this is not a withdrawal request")
    
    if not transaction:
        raise HTTPException(status_code=400, detail="transaction not found")
    
    user = conn.select("users", "id", transaction["result"].user_id)
    
    tsu = datetime.now(timezone.utc)
    
    amountNew = transaction["result"].amount
    
    if int(status) == 3:
        conn.update("transactions", ["status", "update_at", "amount", "is_withdrawal"], [status, tsu, amountNew, True], transaction["result"].id)
    else:
        conn.update("transactions", ["status", "type", "update_at", "is_withdrawal"], [status, 2, tsu, False], transaction["result"].id)
    uids = []
        
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

''' withdraw '''

@app.post("/getdoc/{access_token}")
async def get_doc(request: Request, access_token: str, key: str = Depends(header_scheme), amount: str | None = None, count: str | None = None, package_id: str | None = None, type: int | None = None):
    '''
    type = 0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка, 4 - агентский
    '''
    if amount:
        amount = float(amount)
    else:
        amount = 0
    
    if amount == 0:
        amount = None
    
    if not (amount or count) and not package_id:
        raise HTTPException(status_code=400, detail="error data")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    user = conn.select("users", "uid", uid)
    user_data = conn.select("user_data", "user_id", user["result"].id)
    
    package = conn.select("packages", "id", package_id)
    
    if not package:
        raise HTTPException(status_code=400, detail="package not found")
    
    tx = conn.select("transactions", "user_id", user["result"].id)
    
    if amount:
        if int(amount) == 0:
            amount = int(count) * float(package["result"].price)
    else:
        amount = int(count) * float(package["result"].price)
        
    if count:
        if int(count) == 0:
            count = int(amount / float(package["result"].price))
    else:
        count = int(amount / float(package["result"].price))
        
    uids = [uid]

    message = {"uids": uids}
    
    # type = ""
    
    doc = conn.select("texts", "const", f"dogovor{str(type)}") #добавить type
    dog_id = doc["result"].dog_id
    doc = doc["result"].ru
    conn.disconnect()
    
    now_day = datetime.now().day
    now_months = datetime.now().month
    now_year = datetime.now().year
    
    if user_data["result"].first_name == None or user_data["result"].passport_number == None or user_data["result"].passport_date == None or user_data["result"].city == None:
        raise HTTPException(status_code=400, detail="Заполните данные в профиле.")
    
    doc = doc.replace("{amount}", str(amount))
    doc = doc.replace("{count}", str(count))
    doc = doc.replace("{price}", str(package["result"].price))
    doc = doc.replace("{first_name}", user_data["result"].first_name)
    doc = doc.replace("{birthday}", user_data["result"].birthday)
    doc = doc.replace("{passport_number}", user_data["result"].passport_number)
    doc = doc.replace("{passport_date}", user_data["result"].passport_date)
    doc = doc.replace("{registration}", user_data["result"].registration)
    
    doc = doc.replace("{dog_id}", str(dog_id))
    doc = doc.replace("{now_day}", str(now_day))
    doc = doc.replace("{now_months}", str(now_months))
    doc = doc.replace("{now_year}", str(now_year))
    doc = doc.replace("{text_count}", str(num2words(count, lang='ru')))
    doc = doc.replace("{text_price}", str(num2words(package["result"].price, lang='ru')))
    doc = doc.replace("{text_amount}", str(num2words(amount, lang='ru')))
    doc = doc.replace("{next_day}", str(now_day))
    
    passport_number = user_data["result"].passport_number
    passport_issued = "_______________________________"
    passport_issued2 = "_______________________________"
    passport_date = user_data["result"].passport_date
    address1 = user_data["result"].city
    address2 = "_______________________________"

    doc = doc.replace("{passport_number}", passport_number)
    doc = doc.replace("{passport_issued}", passport_issued)
    doc = doc.replace("{passport_issued2}", passport_issued2)
    doc = doc.replace("{passport_date}", passport_date)
    doc = doc.replace("{address1}", address1)
    doc = doc.replace("{address2}", address2)
    
    print(package_id)
    
    if int(package_id) == 1:
        doc = doc.replace("{a_o1}", "«ТОРУС ГРУПП» (предыдущее наименование Акционерное общество «ТОРУС ФИНАНС ГРУПП»)")
        doc = doc.replace("{a_o2}", "«ТОРУС ГРУПП»")
    else:
        doc = doc.replace("{a_o1}", "«Эклиптикс» (полное фирменное наименование Общества на английском языке: JSC «Ecliptix»)")
        doc = doc.replace("{a_o2}", "«Эклиптикс»")
        
    return {"status": "ok", "dogovor": doc}

@app.get("/getdogovor/{access_token}")
async def get_dogovor(request: Request, access_token: str, hash: str | None = None):
    if not hash:
        raise HTTPException(status_code=400, detail="error data")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    conn = Connection()
    
    transaction = conn.select("transactions", "tx_hash", hash)
    
    if not transaction:
        raise HTTPException(status_code=400, detail="transaction not found")
    
    transaction = transaction["result"]

    
    document = conn.select("texts", "const", f"dogovor{str(transaction.buy_type)}")
    dog_id = document["result"].dog_id
    doc = document["result"].ru
    
    create_at = str(transaction.create_at)
    create_at = create_at.split(" ")
    create_at = create_at[0].split("-")
    
    now_day = create_at[2]
    now_months = create_at[1]
    
    amount = float(transaction.amount)
    count = float(transaction.amount) / float(transaction.price)
    if not count.is_integer():
        count = 0
        
    user_data = conn.select("user_data", "user_id", transaction.user_id)
    
    str_date = str(transaction.create_at)
    str_date = str_date.split(" ")[0]
    str_date = str_date.split("-")
    
    doc = doc.replace("{amount}", str(amount))
    doc = doc.replace("{count}", str(count))
    doc = doc.replace("{price}", str(transaction.price))
    doc = doc.replace("{first_name}", user_data["result"].first_name)
    doc = doc.replace("{birthday}", user_data["result"].birthday)
    doc = doc.replace("{passport_number}", user_data["result"].passport_number)
    doc = doc.replace("{passport_date}", user_data["result"].passport_date)
    doc = doc.replace("{registration}", user_data["result"].registration)
    
    doc = doc.replace("{dog_id}", str(transaction.dog_id))
    doc = doc.replace("{now_day}", str(str_date[2]))
    doc = doc.replace("{now_months}", str(str_date[1]))
    doc = doc.replace("{now_year}", str(str_date[0]))
    doc = doc.replace("{text_count}", str(num2words(count, lang='ru')))
    doc = doc.replace("{text_price}", str(num2words(transaction.price, lang='ru')))
    doc = doc.replace("{text_amount}", str(num2words(amount, lang='ru')))
    doc = doc.replace("{next_day}", str(str_date[2]))
    
    passport_number = "_______________________________"
    if user_data["result"].passport_number:
        passport_number = user_data["result"].passport_number
    passport_issued = "_______________________________"
    passport_issued2 = "_______________________________"
    passport_date = "_______________________________"
    if user_data["result"].passport_date:
        passport_date = user_data["result"].passport_date
    address1 = "_______________________________" 
    if user_data["result"].city:
        address1 = user_data["result"].city
    address2 = "_______________________________"

    doc = doc.replace("{passport_number}", passport_number)
    doc = doc.replace("{passport_issued}", passport_issued)
    doc = doc.replace("{passport_issued2}", passport_issued2)
    doc = doc.replace("{passport_date}", passport_date)
    doc = doc.replace("{address1}", address1)
    doc = doc.replace("{address2}", address2)
    
    print(transaction.package_id)
    
    if int(transaction.package_id) == 1:
        doc = doc.replace("{a_o1}", "«ТОРУС ГРУПП» (предыдущее наименование Акционерное общество «ТОРУС ФИНАНС ГРУПП»)")
        doc = doc.replace("{a_o2}", "«ТОРУС ГРУПП»")
    else:
        doc = doc.replace("{a_o1}", "«Эклиптикс» (полное фирменное наименование Общества на английском языке: JSC «Ecliptix»)")
        doc = doc.replace("{a_o2}", "«Эклиптикс»")

    conn.disconnect()
    
    options = {
        'page-size': 'Letter',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'custom-header': [
            ('Accept-Encoding', 'gzip')
        ],
        'no-outline': None
    }
    
    pdfkit.from_string(doc, f"pdf/{hash}.pdf", options=options)
    
    # with open(f"pdf/{hash}.pdf", 'rb') as pdf:
    return FileResponse(f"pdf/{hash}.pdf")
        
@app.post("/sendreceipt/{access_token}")
async def send_receipt(request: Request, access_token: str, key: str = Depends(header_scheme), obj: str | None = None, tx_hash: str | None = None, receipt: UploadFile | None = None):
    
    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    if not receipt:
        raise HTTPException(status_code=400, detail="error receipt")
    
    
    ext = "jpg"
    
    if receipt.headers['content-type'] == "application/pdf":
        print("--------------receipt----------------")
        print(receipt.headers['content-type'])
        print("--------------receipt----------------")
        ext = "pdf"
    
    conn = Connection()
    
    tx = conn.select("transactions", "tx_hash", tx_hash)
    
    if not tx:
        raise HTTPException(status_code=400, detail="transaction not found")

    if tx["result"].status == 3:
        raise HTTPException(status_code=400, detail="transaction already confirmed")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    path = ""
    uids = [uid]
    if not obj:
        path = "receipt/" + tx_hash + "_receipt." + ext
    else:
        path = "receipt/" + tx_hash + "_receipt." + ext
        uids.append(obj)
    
    try:
        contents = receipt.file.read()
        with open(path, 'wb') as f:
            f.write(contents)
    except Exception:
        print("There was an error uploading the receipt")
    finally:
        receipt.file.close()
        
    tsp = datetime.now(timezone.utc)
        
    conn.update("transactions", ["status", "pending_at"], [1, tsp], tx["result"].id)

    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}
        
@app.post("/acceptverification/{access_token}")
async def accept_verification(request: Request, access_token: str, key: str = Depends(header_scheme), user_uid: str | None = None):
    if not user_uid:
        raise HTTPException(status_code=400, detail="error user uid")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    admin = conn.select("users", "uid", uid)
    
    if admin["result"].role < 3:
        conn.disconnect()
        raise HTTPException(status_code=403, detail="access is denied")
    
    user = conn.select("users", "uid", user_uid)
    
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    
    if user["result"].role > 0:
        raise HTTPException(status_code=400, detail="user already verified")
    
    conn.update("users", ["role", "rejected_verification_message", "pending_verification"], [1, 3, False], user["result"].id)
    
    conn.disconnect()
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + user["result"].uid + "/Cabinet"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/rejectverification/{access_token}")
async def reject_verification(request: Request, access_token: str, rejected_verification_message: str, key: str = Depends(header_scheme), user_uid: str | None = None):
    if not user_uid:
        raise HTTPException(status_code=400, detail="error user uid")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    admin = conn.select("users", "uid", uid)
    
    if admin["result"].role < 3:
        conn.disconnect()
        raise HTTPException(status_code=403, detail="access is denied")
    
    user = conn.select("users", "uid", user_uid)
    
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    
    if user["result"].role > 0:
        raise HTTPException(status_code=400, detail="user already verified")
    
    rejected_verification_message = "2"
    
    conn.update("users", ["rejected_verification_message"], [rejected_verification_message], user["result"].id)
    
    conn.disconnect()
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/acceptagent/{access_token}")
async def accept_agent(request: Request, access_token: str, key: str = Depends(header_scheme)):
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    user = conn.select("users", "uid", uid)
    
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    
    if user["result"].role == 0:
        raise HTTPException(status_code=400, detail="user not verified")
    
    if user["result"].is_agent:
        raise HTTPException(status_code=400, detail="user already agent")
    
    conn.update("users", ["is_agent"], [True], user["result"].id)
    
    conn.disconnect()
    
    message = {"uids": [uid]}
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}
        
@app.post("/confirmpurchase/{access_token}")
async def confirm_purchase(request: Request, access_token: str, key: str = Depends(header_scheme), tx_hash: str | None = None, status: int | None = None, amount: float | None = None):
    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    admin = conn.select("users", "uid", uid)
    
    if status < 2 or status > 3:
        raise HTTPException(status_code=400, detail="status only 3 - accept or 2 - decline")
    
    if not admin:
        raise HTTPException(status_code=403, detail="access denied")
    
    if admin["result"].role < 3:
        raise HTTPException(status_code=403, detail="access denied")
    
    transaction = conn.select("transactions", "tx_hash", tx_hash)
    
    if not transaction:
        raise HTTPException(status_code=400, detail="transaction not found")
    
    if transaction["result"].status == 2:
        raise HTTPException(status_code=400, detail="the transaction has already been rejected")
    
    if transaction["result"].status == 3:
        raise HTTPException(status_code=400, detail="the transaction has already been confirmed")
    
    user = conn.select("users", "id", transaction["result"].user_id)
    
    tsu = datetime.now(timezone.utc)
    
    amountNew = transaction["result"].amount
    
    if amount:
        amountNew = amount
        
    prices = conn.select("packages", "id", transaction["result"].package_id)
    pb = conn.select("bonuses", "id", "1")
    price_n = float(prices["result"].price)
        
    # ---------------------------------
    if transaction["result"].buy_type == 3:
        if status == 3:
            if int(transaction["result"].package_id) == 1:
                if user["result"].fix_price > 0 and user["result"].fix_months > 0:
                    fix_months = user["result"].fix_months
                    price_n = user["result"].fix_price
                    # if amount >= user["result"].fix_all_amount / 12:
                    if float(user["result"].fix_amount) - float(amountNew) <= float(user["result"].fix_amount) - ((float(user["result"].fix_all_amount) / 12) * (12 - fix_months)):
                        fix_months - 1
                    fix_amount = float(user["result"].fix_amount) - amountNew
                    if fix_amount > 0:
                        conn.update("users", ["fix_timestamp", "fix_amount", "fix_months"], [parse_timestamp(user["result"].fix_timestamp) + relativedelta(months=1), fix_amount, fix_months], user["result"].id)
                    else:
                        conn.updateFromStr(f"UPDATE users SET fix_price=0, fix_timestamp=NULL, fix_amount=0, fix_all_amount=0 WHERE id={user['result'].id};")
            elif int(transaction["result"].package_id) == 2:
                if user["result"].fix_price2 > 0 and user["result"].fix_months2 > 0:
                    fix_months2 = user["result"].fix_months2
                    price_n = user["result"].fix_price2
                    # if amount >= user["result"].fix_all_amount2 / 12:
                    if float(user["result"].fix_amount2) - float(amountNew) <= float(user["result"].fix_amount2) - ((float(user["result"].fix_all_amount2) / 12) * (12 - fix_months2)):
                        fix_months2 - 1
                    fix_amount2 = float(user["result"].fix_amount2) - amountNew
                    if fix_amount2 > 0:
                        conn.update("users", ["fix_timestamp2", "fix_amount2", "fix_months2"], [parse_timestamp(user["result"].fix_timestamp2) + relativedelta(months=1), fix_amount2, fix_months2], user["result"].id)
                    else:
                        conn.updateFromStr(f"UPDATE users SET fix_price2=0, fix_timestamp2=NULL, fix_amount2=0, fix_all_amount2=0 WHERE id={user['result'].id};")
        
        conn.update("transactions", ["status", "update_at", "amount", "installment", "price"], [status, tsu, amountNew, True, price_n], transaction["result"].id)
    # ---------------------------------
    else:
        conn.update("transactions", ["status", "update_at", "amount"], [status, tsu, amountNew], transaction["result"].id)
    uids = []
    if transaction["result"].type == 0:
        if status == 3:
            print("pay_bonuses")
            pay_bonuses(user["result"], amountNew, user["result"].username)
            ps_bonuses(user["result"], amountNew, user["result"].username)
            uids.append(update_qualifications(user["result"].id))
            
            conn3 = Connection()
            pool_bonus = amountNew / 100 * 2
            pb = pb["result"].amount
            pb = float(pb) + pool_bonus
            conn3.update("bonuses", ["amount"], [pb], 1)
            conn3.disconnect()
            
        # -----------------------------------
        is_fixed = 0
        is_fixed_ts = '2000-01-01'
        
        if int(transaction["result"].package_id) == 1:
            is_fixed = user["result"].fix_price
            is_fixed_ts = user["result"].fix_timestamp
        elif int(transaction["result"].package_id) == 2:
            is_fixed = user["result"].fix_price2
            is_fixed_ts = user["result"].fix_timestamp2

        is_fixed_ts = is_fixed_ts or '2000-01-01'
        date_now = int(time.mktime(datetime.strptime(datetime.today().strftime('%Y-%m-%d'), "%Y-%m-%d").timetuple()))
        is_fixed_ts = int(time.mktime(datetime.strptime(is_fixed_ts, "%Y-%m-%d").timetuple()))

        user_id = user["result"].id
        conn3 = Connection()
        fix_txs = conn3.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id={user_id} AND status=3 AND (type=0 OR type=4) AND fixed=FALSE;")
        conn3.disconnect()
        
        print("-----------------------------")
        print("txs")
        print(fix_txs[0][0])
        print("-----------------------------")

        curent_price = 0
        price = 0

        if is_fixed > 0 and is_fixed_ts - date_now > 0:
            if fix_txs[0][0] != None:
                curent_price = float(fix_txs[0][0]) / float(is_fixed)
            price = float(is_fixed)
        else:
            curent_price = float(prices["result"].price)
            price = float(prices["result"].price)
            # curent_price = float(fix_txs[0][0]) / float(price)

        f, a = math.modf(curent_price)

        if int(a) > 0:
            conn3 = Connection()
            conn3.updateFromStr(f"UPDATE transactions set fixed = true WHERE user_id = {user['result'].id} AND status=3 AND (type=0 OR type=4) AND fixed = false;")
            conn3.insert("finances", ["user_id", "package_id", "package_count", "package_price"], [user["result"].id, transaction["result"].package_id, a, price])
            conn3.updateFromStr(f"UPDATE users set lo = lo + {a} WHERE id = {user['result'].id};")
            ts = datetime.now(timezone.utc)
            conn3.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price"], [0, 3, 4, user["result"].id, ts, f * price, transaction["result"].package_id, 0])
            conn3.disconnect()
        #-----------------------------------
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/confirmpurchasenobonus/{access_token}")
async def confirm_purchase(request: Request, access_token: str, key: str = Depends(header_scheme), tx_hash: str | None = None, status: int | None = None):
    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    admin = conn.select("users", "uid", uid)
    
    if status < 2 or status > 3:
        raise HTTPException(status_code=400, detail="status only 2 - accept or 3 - decline")
    
    if not admin:
        raise HTTPException(status_code=403, detail="access denied")
    
    if admin["result"].role < 3:
        raise HTTPException(status_code=403, detail="access denied")
    
    transaction = conn.select("transactions", "tx_hash", tx_hash)
    
    if not transaction:
        raise HTTPException(status_code=400, detail="transaction not found")
    
    user = conn.select("users", "id", transaction["result"].user_id)
    
    tsu = datetime.now(timezone.utc)
    
    conn.update("transactions", ["status", "update_at"], [status, tsu], transaction["result"].id)
    uids = []
    if transaction["result"].type == 0:
        if status == 3:
            uids.append(update_qualifications(user["result"].id))
            
        # -----------------------------------
        is_fixed = 0
        is_fixed_ts = '2000-01-01'
        
        if int(transaction["result"].package_id) == 1:
            is_fixed = user["result"].fix_price
            is_fixed_ts = user["result"].fix_timestamp
        elif int(transaction["result"].package_id) == 2:
            is_fixed = user["result"].fix_price2
            is_fixed_ts = user["result"].fix_timestamp2

        is_fixed_ts = is_fixed_ts or '2000-01-01'
        date_now = int(time.mktime(datetime.strptime(datetime.today().strftime('%Y-%m-%d'), "%Y-%m-%d").timetuple()))
        is_fixed_ts = int(time.mktime(datetime.strptime(is_fixed_ts, "%Y-%m-%d").timetuple()))

        user_id = user["result"].id
        fix_txs = conn.selectWhereStr(f"SELECT SUM(amount) FROM transactions WHERE user_id={user_id} AND status=3 AND (type=0 OR type=4) AND fixed=FALSE;")

        curent_price = 0
        price = 0

        if is_fixed > 0 and is_fixed_ts - date_now > 0:
            curent_price = float(fix_txs[0][0]) / float(is_fixed)
            price = float(is_fixed)
        else:
            price = conn.select("packages", "id", transaction["result"].package_id, ["price"])
            curent_price = float(price["result"].price)
            price = float(price["result"].price)
            curent_price = float(fix_txs[0][0]) / float(price)

        f, a = math.modf(curent_price)

        if int(a) > 0:
            conn.updateFromStr(f"UPDATE transactions set fixed = true WHERE user_id = {user['result'].id} AND status=3 AND (type=0 OR type=4) AND fixed = false;")
            conn.insert("finances", ["user_id", "package_id", "package_count", "package_price"], [user["result"].id, transaction["result"].package_id, a, price])
            ts = datetime.now(timezone.utc)
            conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price"], [0, 3, 4, user["result"].id, ts, f * price, transaction["result"].package_id, 0])
        #-----------------------------------
        
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/activepsbonus/{access_token}")
async def confirm_purchase(request: Request, access_token: str, key: str = Depends(header_scheme), package_id: int | None = None, status: bool | None = None):
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    admin = conn.select("users", "uid", uid)
    if not admin:
        raise HTTPException(status_code=403, detail="access denied")
    
    if admin["result"].role < 3:
        raise HTTPException(status_code=403, detail="access denied")
    
    if status == None:
        raise HTTPException(status_code=403, detail="status undefined")
    
    if package_id == None:
        raise HTTPException(status_code=403, detail="package_id undefined")

    conn.update("packages", ["bonus"], [status], package_id)
        
    message = {"uids": uid}
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/manualbonus/{access_token}")
async def manual_bonus(request: Request, access_token: str, key: str = Depends(header_scheme), user_uid: str | None = None, package_id: int | None = None, amount: float | None = None, buy_type: int | None = None, type_bonus: bool | None = None):
    decoded_data = verify_jwt_token(access_token)
    if not decoded_data:
        raise HTTPException(status_code=400, detail="error access_token")

    uid = decoded_data["sub"]
    
    conn = Connection()
    
    admin = conn.select("users", "uid", uid)
    if not admin:
        raise HTTPException(status_code=403, detail="access denied")
    
    if admin["result"].role < 3:
        raise HTTPException(status_code=403, detail="access denied")
    
    print("package_id")
    print(package_id)
    print("package_id")
    
    if package_id == None:
        package_id = 1
        # raise HTTPException(status_code=403, detail="package_id undefined")
    
    if amount == None or amount == 0:
        raise HTTPException(status_code=403, detail="amount undefined or 0")
    
    if buy_type == None:
        raise HTTPException(status_code=403, detail="buy type undefined")
    
    if type_bonus == None:
        raise HTTPException(status_code=403, detail="type bonus undefined")

    if user_uid == None:
        raise HTTPException(status_code=403, detail="user uid undefined")

    conn2 = Connection()
    user = conn2.select("users", "uid", user_uid)
    conn2.disconnect()
    if not user:
        raise HTTPException(status_code=403, detail="user not found")
        
    user = user["result"]

    tx = send_receiptb(mail=user.email, amount=amount, package_id=package_id, type=buy_type)

    if type_bonus == True:
        confirm_purchase_bonus(tx["hash"])
    else:
        confirm_purchase_no_bonus(tx["hash"])
        
    message = {"uids": uid}
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid + "/update"
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}