#!/bin/bash

echo "input service name:"
read pathname

cd $pathname

git pull

cd ..

screen -XS auth_tfg quit
screen -XS messages_tfg quit
screen -XS main_tfg quit

cd auth
source auth/bin/activate
screen -dmS auth_tfg uvicorn main:app --port 8000
deactivate

cd ../messages
source messages/bin/activate
screen -dmS messages_tfg uvicorn main:app --port 8015
deactivate

cd ../main
source main/bin/activate
screen -dmS main_tfg uvicorn main:app --port 8001
deactivate

