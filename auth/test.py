from db.db import Connection

connection = Connection()

obj = connection.select("users", "email", "elf-it@yatt.ru", ["uid", "email"])
if obj:
    print(obj["schema"])
    print(obj["result"].email)