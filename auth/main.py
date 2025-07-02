import json
import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, Annotated
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import hashlib
from dotenv import load_dotenv

from lib.jwt import create_jwt_token, verify_jwt_token
from db.db import Connection

load_dotenv()

app = FastAPI(title='TFG auth service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://userfront.srws.ru"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

header_scheme = APIKeyHeader(name="x-service-auth-key")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def check(key):
    if key != os.getenv("AUTH_SERVICE_KEY_TOKEN"):
        raise HTTPException(status_code=500, detail="invalid x-service-auth-key")

@app.post("/registration")
def register_user(key: str = Depends(header_scheme), obj: Union[dict, None] = None):
    
    '''
    {
        "email": "email",
        "password": "password",
        "referrer": "referrer"
    }
    '''
    check(key)

    if "email" not in obj or "password" not in obj or "referrer" not in obj:
        raise HTTPException(status_code=400, detail="error data")
    connection = Connection()
    is_referrer = connection.select("user_data", "referal_link", obj["referrer"])
    refer_data = connection.select("users", "id", is_referrer["result"].user_id)
    if not is_referrer:
        raise HTTPException(status_code=400, detail="referrer not found")
    
    if not refer_data:
        raise HTTPException(status_code=400, detail="referrer not found")
    
    username = obj["email"]
    if "login" in obj:
        username = obj["login"]
    
    isLogin = connection.select("users", "username", username)
    
    if isLogin:
        raise HTTPException(status_code=400, detail="the login already exists")

    is_user = connection.select("users", "email", obj["email"].lower())
    if not is_user:
        hashed_password = pwd_context.hash(obj["password"])
        m = hashlib.sha256()
        m.update(bytes(obj["email"] + obj["password"],'UTF-8'))
        uid = m.hexdigest()

            
        structure = ""
        
        if refer_data["result"].structure:
            structure = refer_data["result"].structure + " " + str(is_referrer["result"].user_id)
        else:
            structure = str(is_referrer["result"].user_id)
        
        tsu = datetime.now(timezone.utc)
    
        connection.insert("users", ["uid", "username", "pass_hash", "role", "email", "structure", "my_structure", "reg_date"], [uid, username, hashed_password, 0, obj["email"].lower(), structure, "{}", tsu])
                
        ui = connection.select("users", "email", obj["email"].lower())
        
        '''
        lst = [int(x) for x in structure.split()]
        string = ""
        for l in range(len(lst)):
            string += f"id = {lst[l]}"
            if l < len(lst) - 1:
                string += " or "
        connection.updateFromStr(f"UPDATE users SET my_structure = CONCAT(my_structure, ' ', {ui["result"].id}) WHERE {string};")
        '''
        lst = [int(x) for x in structure.split()]
        lst.reverse()
        perem = ""
        for l in range(len(lst)):
            if l > 0:
                perem = f"['{lst[l - 1]}']" + perem
            au = connection.select("users", "id", lst[l])
            id = au["result"].id
            au = json.loads(au["result"].my_structure)
            exec(f"au{perem}['{ui["result"].id}'] = dict()")
            connection.update("users", ["my_structure"], [json.dumps(au)], id)
        
        connection.insert("user_data", ["user_id", "referal_link", "reffer_id"], [ui["result"].id, uid, is_referrer["result"].user_id])
        connection.disconnect()
        return {"uid": uid, "username": username, "hashed_password": hashed_password, "role": 0}
    connection.disconnect()
    raise HTTPException(status_code=400, detail="user exist")

#@app.post("/personaldata")
#def personal_data(obj: Union[dict, None] = None):
    

@app.post("/login")
def authenticate_user(key: str = Depends(header_scheme), obj: Union[dict, None] = None, site: str | None = Header(default=None)):

    '''
    {
        "email": "email",
        "password": "password"
    }
    '''

    check(key)

    if "email" not in obj or "password" not in obj:
        return {"error": {"code": 1001, "text": "error data"}}
    connection = Connection()
    user = connection.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    connection.disconnect()

    user = user["result"]
    is_password_correct = pwd_context.verify(obj["password"], user.pass_hash)

    if not is_password_correct:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    jwt_token = create_jwt_token({"sub": user.uid})

    if not user.verified:
        raise HTTPException(status_code=400, detail={"error": "User not verified", "access_token": jwt_token})
    
    print(site)
    if site == os.getenv("ADMIN_FRONTEND") and user.role < 3:
        raise HTTPException(status_code=403, detail="access denied")

    return {"access_token": jwt_token, "token_type": "bearer"}

@app.post("/getdata")
def get_current_user(key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    {
        "access_token": "access_token"
    }
    '''

    check(key)

    if "access_token" not in obj:
        raise HTTPException(status_code=400, detail="Invalid token1")
    decoded_data = verify_jwt_token(obj["access_token"])
    if not decoded_data:
        raise HTTPException(status_code=400, detail="Invalid token2")
    connection = Connection()
    user = connection.select("users", "uid", decoded_data["sub"])
    connection.disconnect()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    return user

@app.post("/verification")
def Verification(key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    {
        "email": "email",
        "password": "password",
        "code": "code"
    }
    '''

    check(key)

    if "email" not in obj or "password" not in obj or "code" not in obj:
        raise HTTPException(status_code=400, detail="error data")
    
    conn = Connection()
    user = conn.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    user = user["result"]

    is_password_correct = pwd_context.verify(obj["password"], user.pass_hash)

    if not is_password_correct:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if user.verify_code == None:
        conn.disconnect()
        raise HTTPException(status_code=400, detail="code is null")

    if str(obj["code"]) == str(user.verify_code):
        conn.update("users", ["verified"], [True], user.id)
        conn.disconnect()
        jwt = create_jwt_token({"sub": user.uid})
        return {"status": "ok", "access_token": jwt}
    
    if user.attempts <= 0:
        conn.update("users", ["verify_code"], [None], user.id)
        conn.disconnect()
        raise HTTPException(status_code=400, detail="code is null")

    attempts = user.attempts - 1
    conn.update("users", ["attempts"], [attempts], user.id)
    conn.disconnect()
    raise HTTPException(status_code=400, detail="error code")

@app.post("/verificationnewpassword")
def Verification(key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    {
        "email": "email",
        "password": "password",
        "code": "code"
    }
    '''

    check(key)

    if "email" not in obj or "password" not in obj or "code" not in obj:
        raise HTTPException(status_code=400, detail="error data")
    
    conn = Connection()
    user = conn.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    user = user["result"]

    if user.verify_code_password == None:
        conn.disconnect()
        raise HTTPException(status_code=400, detail="code is null")
    
    pass_hash = pwd_context.hash(obj["password"])

    if str(obj["code"]) == str(user.verify_code_password):
        conn.update("users", ["pass_hash"], [pass_hash], user.id)
        conn.disconnect()
        jwt = create_jwt_token({"sub": user.uid})
        return {"status": "ok", "access_token": jwt}

    conn.disconnect()
    raise HTTPException(status_code=400, detail="error code")

@app.post("/code2code")
def Code2code(key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    {
        "email": "email",
        "code": "code"
    }
    '''

    check(key)

    if "email" not in obj or "code" not in obj:
        raise HTTPException(status_code=400, detail="error data")
    
    conn = Connection()
    user = conn.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    user = user["result"]

    if user.verify_code_password == None:
        conn.disconnect()
        raise HTTPException(status_code=400, detail="code is null")

    conn.disconnect()
    if str(obj["code"]) == str(user.verify_code_password):
        return {"status": "ok"}
    else:
        return {"status": "error"}