#!/bin/bash

screen -XS auth_tfg quit
screen -XS messages_tfg quit
screen -XS main_tfg quit
screen -XS torus_front_user quit
screen -XS torus_front_admin quit

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

cd ../frontend/user
screen -dmS torus_front_user npm run preview

cd ../admin
screen -dmS torus_front_admin npm run preview
