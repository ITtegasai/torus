# Подробная документация

## generate_docs.py

## main/set_lo.py

## main/test777.py

## main/get_lp.py
- `def get_lb(user_id)`

## main/test2.py

## main/migration_quals.py
- `def update_qualifications()`

## main/test.py
- `def send_receipt(mail, amount, count, package_id, type)`
  - type = 0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка
- `def confirm_purchase(tx_hash)`
- `def confirm_purchase_bonus(tx_hash)`

## main/mainTest.py
- `def generate_html_response(client_jwt)`
- `def generate_html_response_admin(client_jwt)`
- `def check(key)`
- `def get_verification_images(access_token, key)`
- `def get_verification_images(access_token, key, type, uid)`
- `def get_receipts(access_token, key, tx_hash)`

## main/pool_bonuses.py
- `def get_lb_months(user_id)`
- `def pool_bonuses()`

## main/migration_balance.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self, db_obj)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereCase(self, s)`
  - `    def selectWhereString(self, s)`
  - `    def selectWhereStr(self, s)`
- `def confirm_purchase(conn, tx_hash, status)`

## main/test4.py
- `def pay_bonuses(user, amount, initiator_id, line)`
  - bonus_type - 0 - реферальный бонус, 1 - подключаемый бонус
- `def ps_bonuses(user, amount, initiator_id, line)`

## main/test3.py

## main/main.py
- `def parse_timestamp(timestamp)`
- `def generate_html_response(client_jwt)`
- `def generate_html_response_admin(client_jwt)`
- `class ConnectionManager`
  - `    def __init__(self)`
  - `    def disconnect(self, websocket, uid)`
- `def check(key)`
- `def get_verification_images(access_token, key)`
- `def get_verification_images(access_token, key, type, uid)`
- `def get_receipts(access_token, key, tx_hash)`

## main/migration.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self, db_obj)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereCase(self, s)`
  - `    def selectWhereString(self, s)`
  - `    def selectWhereStr(self, s)`

## main/tr_to_csv.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self, db_obj)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereCase(self, s)`
  - `    def selectWhereString(self, s)`
  - `    def selectWhereStr(self, s)`

## main/get_struct.py
- `def us_in_line(dc, line)`

## main/pdf/pdf.py

## main/pages/Users.py
- `def represents_number(s)`
- `class Users`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = {"Users": {"uid": "uid"}, "UserData": {"first_name": "first_name"}}

## main/pages/Partnership.py

## main/pages/Bonuses.py
- `class Bonuses`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = "amount >= 3000 and amount < 100001"

## main/pages/UsersData.py
- `class UsersData`
  - `    def get(self, params)`

## main/pages/Finances.py
- `class Finances`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = "amount >= 3000 and amount < 100001"

## main/pages/UsersUnverify.py
- `class UsersUnverify`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = {"Users": {"uid": "uid"}, "UserData": {"first_name": "first_name"}}

## main/pages/User.py
- `class User`
  - `    def get(self, uid, tx_type, limit, offset, filter)`

## main/pages/Cabinet.py
- `class Cabinet`
  - `    def get(self, uid, tx_type, limit, offset, filter)`

## main/pages/Structure.py
- `class Structure`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = {id}

## main/pages/About.py
- `class About`
  - `    def get(self, uid, tx_type, limit, offset, filter)`

## main/pages/UserData.py
- `class UserData`
  - `    def get(self, params)`

## main/pages/Invoices.py
- `def represents_number(s)`
- `class Invoices`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = "transactions.amount >= 3000 and transactions.amount < 100001"

## main/pages/Vacancy.py

## main/pages/Main.py
- `class Main`
  - `    def get(self, uid, tx_type, limit, offset, filter)`

## main/pages/News.py
- `class News`
  - `    def get(self, uid, tx_type, limit, offset, filter)`
    - filter = news_id | None

## main/helpers/func_creator.py
- `def func_creator(uid, data_ws)`

## main/helpers/d2o.py
- `class DictObj`
  - `    def __init__(self, in_dict)`
- `class PersonEncoder`
  - `    def default(self, obj)`

## main/marketing/bonus_types.py
- `def bonus_types()`

## main/marketing/qualifications.py
- `def extract_nested_keys(d)`
- `def get_lb(user_id)`
- `def get_go(user_id)`
- `def get_lo(user_id)`
- `def get_qualification_parthners_in_line(user_id)`
- `def get_qualification_parthners(user_id)`
- `def update_qual(user_id, qualifications, x)`
- `def update_qualifications(user_id)`

## main/marketing/manual_bonus.py
- `def send_receiptb(mail, amount, count, package_id, type)`
  - type = 0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка
- `def confirm_purchase_no_bonus(tx_hash)`
- `def confirm_purchase_bonus(tx_hash)`

## main/marketing/bonuses.py
- `def pay_bonuses(user, amount, initiator_id, line)`
  - bonus_type - 0 - реферальный бонус, 1 - подключаемый бонус
- `def ps_bonuses(user, amount, initiator_id, line)`

## main/db/db.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereCase(self, s)`
  - `    def selectWhereString(self, s)`
  - `    def selectWhereStr(self, s)`

## main/lib/jwt.py
- `def create_jwt_token(data)`
- `def verify_jwt_token(token)`

## auth/test.py

## auth/main.py
- `def check(key)`
- `def register_user(key, obj)`
  - {
- `def authenticate_user(key, obj, site)`
  - {
- `def get_current_user(key, obj)`
  - {
- `def Verification(key, obj)`
  - {
- `def Verification(key, obj)`
  - {
- `def Code2code(key, obj)`
  - {

## auth/helpers/d2o.py
- `class DictObj`
  - `    def __init__(self, in_dict)`

## auth/db/db.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereString(self, s)`

## auth/lib/jwt.py
- `def create_jwt_token(data)`
- `def verify_jwt_token(token)`

## messages/main.py
- `def check(key)`
- `def send_verification_code(key, obj)`
  - Принимает параметры:
- `def send_verification_code(key, obj)`
  - Принимает параметры:
- `def send_verification_code(key, obj)`
  - {

## messages/helpers/d2o.py
- `class DictObj`
  - `    def __init__(self, in_dict)`

## messages/db/db.py
- `def helper(s)`
- `def helper2(k, v)`
- `class Connection`
  - `    def __init__(self)`
  - `    def disconnect(self)`
  - `    def insert(self, table, keys, values)`
  - `    def update(self, table, keys, values, id)`
  - `    def updateFromStr(self, s)`
  - `    def delete(self, table, id)`
  - `    def select(self, table, where_key, where_value, key)`
  - `    def selectWhereList(self, table, where_key_value, key)`
  - `    def selectWhereString(self, s)`

## messages/lib/jwt.py
- `def create_jwt_token(data)`
- `def verify_jwt_token(token)`
