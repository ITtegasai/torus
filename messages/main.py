import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import random
import json
from fastapi.security import APIKeyHeader
import os

from db.db import Connection
from lib.jwt import verify_jwt_token
from dotenv import load_dotenv

load_dotenv()

smtp_server = os.getenv("SMTP_SERVER")
smtp_port = os.getenv("SMTP_PORT")
smtp_email = os.getenv("SMTP_EMAIL")
smtp_password = os.getenv("SMTP_PASSWORD")

app = FastAPI(title='TFG message service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

header_scheme = APIKeyHeader(name="x-service-auth-key")

def check(key):
    if key != os.getenv("MESSAGE_SERVICE_KEY_TOKEN"):
        raise HTTPException(status_code=500, detail="invalid x-service-auth-key")

@app.post("/sendverificationcode")
def send_verification_code(key: str = Depends(header_scheme), obj: Union[dict, None] = None):
    '''
    Принимает параметры:
    {
        "email"
    }
    Возвращает:
    {
        "result": "ok"
        или
        "error"
    }
    '''

    check(key)

    if "email" not in obj:
        return {"error": {"code": 1001, "text": "error data"}}
    
    # decoded_data = verify_jwt_token(obj["client_jwt"])
    # if not decoded_data:
    #     return {"error": {"code": 1000, "text": "error jwt"}}

    # uid = decoded_data["sub"]
    conn = Connection()
    user = conn.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    user = user["result"]

    if user.verified:
        return {"error": {"code": 1008, "text": "already verified"}}

    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    # server.starttls()

    message_arr = conn.select("messagestexts", "const", "message_verify_code")

    if not message_arr:
        return {"error": {"code": 1001, "text": "error data"}}
    
    message_arr = message_arr["result"]

    message = message_arr.ru

    code = str(random.randint(100000,999999))

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Verification code"
    msg['From'] = smtp_email
    msg['To'] = user.email


    message = message.replace('{verify_code}', code)
    message = MIMEText(message, 'html')

    msg.attach(message)

    conn.update("users", ["verify_code"], [code], user.id)

    conn.disconnect()

    server.login(smtp_email, smtp_password)
    server.sendmail(smtp_email, user.email, msg.as_string())

    server.quit()
    return {"result": "ok"}

@app.post("/sendverificationcodechangepassword")
def send_verification_code(key: str = Depends(header_scheme), obj: Union[dict, None] = None):
    '''
    Принимает параметры:
    {
        "email"
    }
    Возвращает:
    {
        "result": "ok"
        или
        "error"
    }
    '''

    check(key)

    if "email" not in obj:
        return {"error": {"code": 1001, "text": "error data"}}

    conn = Connection()
    user = conn.select("users", "email", obj["email"].lower())
    if not user:
        raise HTTPException(status_code=400, detail="user not found")
    user = user["result"]

    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    # server.starttls()

    message_arr = conn.select("messagestexts", "const", "message_verify_code")

    if not message_arr:
        return {"error": {"code": 1001, "text": "error data"}}
    
    message_arr = message_arr["result"]

    message = message_arr.ru

    code = str(random.randint(100000,999999))

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Verification code"
    msg['From'] = smtp_email
    msg['To'] = user.email


    message = message.replace('{verify_code}', code)
    message = MIMEText(message, 'html')

    msg.attach(message)

    conn.update("users", ["verify_code_password"], [code], user.id)

    conn.disconnect()

    server.login(smtp_email, smtp_password)
    server.sendmail(smtp_email, user.email, msg.as_string())

    server.quit()
    return {"result": "ok"}

@app.post("/sendnotification")
def send_verification_code(key: str = Depends(header_scheme), obj: Union[dict, None] = None):

    '''
    {
        "client_jwt",
        "notification",
        "data": [{"key": "", "value": ""}]
    }

    Return:
    {
        "email": ""
        or
        "error"
    }
    '''

    check(key)

    if "client_jwt" not in obj or "notification" not in obj:
        return {"error": {"code": 1001, "text": "error data"}}
    
    decoded_data = verify_jwt_token(obj["client_jwt"])
    if not decoded_data:
        return {"error": {"code": 1000, "text": "error jwt"}}

    uid = decoded_data["sub"]
    conn = Connection()
    user = conn.select("users", "uid", uid)
    user = user["result"]

    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    # server.starttls()

    message_arr = conn.select("messagestexts", "const", obj["notification"])
    conn.disconnect()

    if not message_arr:
        return {"error": {"code": 1001, "text": "error data"}}
    
    message_arr = message_arr["result"]

    message = message_arr.ru

    msg = MIMEMultipart('alternative')
    msg['Subject'] = obj["notification"]
    msg['From'] = smtp_email
    msg['To'] = user.email

    if "data" in obj:
        for d in obj["data"]:
            message = message.replace('{' + d["key"] + '}', d["value"])

    message = MIMEText(message, 'html')

    msg.attach(message)

    server.login(smtp_email, smtp_password)
    server.sendmail(smtp_email, user.email, msg.as_string())

    server.quit()
    return {"email": user.email}