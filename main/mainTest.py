import base64
from datetime import datetime, timezone
import hashlib
import json
import math
import os
import time
from typing import Union

from fastapi import Depends, File, Request, FastAPI, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse

from dotenv import load_dotenv
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from starlette.websockets import WebSocketState
import websockets

from db.db import Connection
from helpers import func_creator
from lib.jwt import verify_jwt_token
from marketing.bonuses import pay_bonuses, ps_bonuses
from marketing.qualifications import update_qualifications

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

@app.websocket("/ws/{client_jwt}")
async def websocket_endpoint(websocket: WebSocket, client_jwt: str):
    await websocket.accept()
    decoded_data = verify_jwt_token(client_jwt)
    if not decoded_data:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    uid = decoded_data["sub"]
    conn = Connection()
    user = conn.select("users", "uid", uid)
    if not user:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    user = user["result"]
    if uid in clients:
        clients[uid].append({"websocket": websocket, "role": user.role})
    else:
        clients[uid] = [{"websocket": websocket, "role": user.role}]
    
    conn.update("users", ["is_online"], [True], user.id)
    
    # for client in clients.keys():
    #     for client
    #     if clients[client]["role"] > 1 and client["websocket"] != websocket:
    #         await client["websocket"].send_text("update")
    
    conn.disconnect()
    while True:
        try:
            data_ws = await websocket.receive_text()

            message = func_creator.func_creator(uid, data_ws)

            message["message"] = json.loads(data_ws)

            #print(message)

            # for client in clients:
            #     if client["uid"] == uid:
            #         await client["websocket"].send_text(json.dumps(message))
            #     if client["role"] > 1 and client["websocket"] != websocket:
            await websocket.send_text(json.dumps(message))
        
        except WebSocketException as wexc:
            print(wexc)
            # conn = Connection()
            # conn.update("users", ["is_online"], [False], user.id)
            # conn.disconnect()
            
            # for client in clients.keys():
            #     for c in range(len(clients[client])):
            #         if clients[client][c]["websocket"] == websocket:
            #             clients[client].remove(c)
            #             websocket.close()
            #             break
            #     if len(clients[client]) == 0:
            #         del clients[client]
            #     break
                        
            # for client in clients:
            #     if client["role"] > 1 or client["websocket"] != websocket:
            #         await client["websocket"].send_text("update")
        
        except BaseException as exc:
            print(exc)
        #     conn = Connection()
        #     conn.update("users", ["is_online"], [False], user.id)
        #     conn.disconnect()
            
        #     for client in clients.keys():
        #         for c in range(len(clients[client])):
        #             if clients[client][c]["websocket"] == websocket:
        #                 clients[client].remove(c)
        #                 websocket.close()
        #                 break
        #         if len(clients[client]) == 0:
        #             del clients[client]
        #         break
                        
        except WebSocketDisconnect():
            conn = Connection()
            conn.update("users", ["is_online"], [False], user.id)
            conn.disconnect()
            
            for client in clients.keys():
                for c in range(len(clients[client])):
                    if clients[client][c]["websocket"] == websocket:
                        clients[client].remove(c)
                        websocket.close()
                        break
                if len(clients[client]) == 0:
                    del clients[client]
                break

@app.websocket("/ws/admin/{client_jwt}")
async def websocket_endpoint_admin(websocket: WebSocket, client_jwt: str):
    await websocket.accept()
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
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    
    conn.update("users", ["is_online"], [True], user.id)
    if uid in clients:
        clients[uid].append({"websocket": websocket, "role": user.role})
    else:
        clients[uid] = [{"websocket": websocket, "role": user.role}]
    
    conn.update("users", ["is_online"], [True], user.id)
    
    # for client in clients:
    #     if client["role"] > 1 and client["websocket"] != websocket:
    #         await client["websocket"].send_text("update")
    conn.disconnect()
    while True:
        try:
            data_ws = await websocket.receive_text()

            message = func_creator.func_creator(uid, data_ws)

            message["message"] = json.loads(data_ws)
                        
            await websocket.send_text(json.dumps(message))
            
        except WebSocketException as wexc:
            print(wexc)
            # conn = Connection()
            # conn.update("users", ["is_online"], [False], user.id)
            # conn.disconnect()
            
            # for client in clients.keys():
            #     for c in range(len(clients[client])):
            #         if clients[client][c]["websocket"] == websocket:
            #             clients[client].remove(c)
            #             websocket.close()
            #             break
            #     if len(clients[client]) == 0:
            #         del clients[client]
            #     break
        
        except BaseException as exc:
            print(exc)
            # conn = Connection()
            # conn.update("users", ["is_online"], [False], user.id)
            # conn.disconnect()
            
            # for client in clients.keys():
            #     for c in range(len(clients[client])):
            #         if clients[client][c]["websocket"] == websocket:
            #             clients[client].remove(c)
            #             websocket.close()
            #             break
            #     if len(clients[client]) == 0:
            #         del clients[client]
            #     break
            
        except WebSocketDisconnect():
            conn = Connection()
            conn.update("users", ["is_online"], [False], user.id)
            conn.disconnect()
            
            for client in clients.keys():
                for c in range(len(clients[client])):
                    if clients[client][c]["websocket"] == websocket:
                        clients[client].remove(c)
                        websocket.close()
                        break
                if len(clients[client]) == 0:
                    del clients[client]
                break
        
@app.websocket("/ws/update/{uid}")
async def websocket_endpoint_update(websocket: WebSocket, uid: str):
    await websocket.accept()
    # try:
    data_ws = await websocket.receive_text()
    for client in clients.keys():
        for c in range(len(clients[client])):
            if clients[client][c]["role"] > 1 or client == uid:
                await clients[client][c]["websocket"].send_text("update")
    
    # except WebSocketDisconnect():
    #     print("updater disconnected")


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
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
        try:
            contents = image.file.read()
            with open("images/" + uid + ".jpg", 'wb') as f:
                f.write(contents)
        except Exception:
            print("There was an error uploading the file")
        finally:
            image.file.close()
            
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
        try:
            contents = passport.file.read()
            with open("vimages/" + uid + "_passport.jpg", 'wb') as f:
                f.write(contents)
        except Exception:
            print("There was an error uploading the passport")
        finally:
            passport.file.close()
            
    if selfie:
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
    conn.update("users", ["rejected_verification_message"], ["1"], user.id)
    conn.disconnect()
            
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
                path["files"] = {"filename": tx_hash + "_receipt.jpg", "filedata": receipt_string}
    
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
    
    user = conn.select("users", "uid", uid)
    
    if user["result"].role == 0:
        raise HTTPException(status_code=403, detail="verification is required")
    
    package = conn.select("packages", "id", package_id)
    
    if not package:
        raise HTTPException(status_code=400, detail="package not found")
    
    tx = conn.select("transactions", "user_id", user["result"].id)
    
    if not tx and user["result"].role == 1:
        conn.update("users", ["role"], [2], user["result"].id)
        
    ts = datetime.now(timezone.utc)
    
    m = hashlib.shake_256(bytes(uid + str(ts),'UTF-8'))

    tx_hash = m.hexdigest(4)
    
    if not amount:
        amount = int(count) * float(package["result"].price)
        
    installment = False
    if type == 3:
        installment = True
        
    conn.insert("transactions", ["tx_hash", "status", "type", "user_id", "create_at", "amount", "package_id", "price", "installment"], [tx_hash, 0, 0, user["result"].id, ts, amount, package_id, package["result"].price, installment])
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok", "hash": tx_hash}

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
    
    if not amount:
        amount = int(count) * float(package["result"].price)
    
    uids = [uid]

    message = {"uids": uids}
    
    # type = ""
    
    doc = conn.select("texts", "const", f"dogovor{str(type)}") #добавить type
    doc = doc["result"].ru
    
    doc = doc.replace("{amount}", str(amount))
    doc = doc.replace("{first_name}", user_data["result"].first_name)
        
    return {"status": "ok", "dogovor": doc}
        
@app.post("/sendreceipt/{access_token}")
async def send_receipt(request: Request, access_token: str, key: str = Depends(header_scheme), obj: str | None = None, tx_hash: str | None = None, receipt: UploadFile | None = None):
    
    if not tx_hash:
        raise HTTPException(status_code=400, detail="error tx_hash")
    
    if not receipt:
        raise HTTPException(status_code=400, detail="error receipt")
    
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
        path = "receipt/" + tx_hash + "_receipt.jpg"
    else:
        path = "receipt/" + tx_hash + "_receipt.jpg"
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

    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
    
    conn.update("users", ["role", "qualification", "rejected_verification_message"], [1, 1, 3], user["result"].id)
    
    conn.disconnect()
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
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
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}
        
@app.post("/confirmpurchase/{access_token}")
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
            pay_bonuses(user["result"], transaction["result"].amount, user["result"].username)
            ps_bonuses(user["result"], transaction["result"].amount, user["result"].username)
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

        if is_fixed > 0 and is_fixed_ts - date_now > 0:
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
        
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}

@app.post("/activepsbonus/{access_token}")
async def confirm_purchase(request: Request, access_token: str, key: str = Depends(header_scheme), status: bool | None = None):
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

    conn.update("packages", ["bonus"], [status], 1)
        
    message = {"uids": uid}
    
    wss = str(request.base_url).replace("http", "ws") + "ws/update/" + uid
    async with websockets.connect(wss) as websocket:
        await websocket.send("update")
        
    return {"status": "ok"}