import json
import builtins
from types import ModuleType
import os
import sys

import pytest

# Ensure project root is on sys.path so tests can import modules
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# main.main expects a top-level 'db' package. Point it to main.db for tests.
import importlib

# main.db.db expects a top-level 'helpers' package. Register it first.
helpers_pkg = ModuleType("helpers")
helpers_pkg.d2o = importlib.import_module("main.helpers.d2o")
helpers_pkg.func_creator = importlib.import_module("main.helpers.func_creator")
sys.modules.setdefault("helpers", helpers_pkg)
sys.modules.setdefault("helpers.d2o", helpers_pkg.d2o)
sys.modules.setdefault("helpers.func_creator", helpers_pkg.func_creator)

# main.main expects a top-level 'db' package. Point it to main.db for tests.
db_pkg = ModuleType("db")
db_module = ModuleType("db.db")

class DummyConnection:
    def __init__(self, *a, **k):
        pass
    def updateFromStr(self, *a, **k):
        pass
    def disconnect(self, *a, **k):
        pass

db_module.Connection = DummyConnection
db_pkg.db = db_module
sys.modules.setdefault("db", db_pkg)
sys.modules.setdefault("db.db", db_module)

# main.main imports 'lib.jwt' module.
lib_pkg = ModuleType("lib")
lib_pkg.jwt = importlib.import_module("main.lib.jwt")
sys.modules.setdefault("lib", lib_pkg)
sys.modules.setdefault("lib.jwt", lib_pkg.jwt)

# main.main imports marketing modules.
marketing_pkg = ModuleType("marketing")
marketing_pkg.bonuses = ModuleType("marketing.bonuses")
marketing_pkg.bonuses.pay_bonuses = lambda *a, **k: None
marketing_pkg.bonuses.ps_bonuses = lambda *a, **k: None
marketing_pkg.qualifications = ModuleType("marketing.qualifications")
marketing_pkg.qualifications.update_qualifications = lambda *a, **k: 1
marketing_pkg.manual_bonus = ModuleType("marketing.manual_bonus")
marketing_pkg.manual_bonus.send_receiptb = lambda *a, **k: None
marketing_pkg.manual_bonus.confirm_purchase_bonus = lambda *a, **k: None
marketing_pkg.manual_bonus.confirm_purchase_no_bonus = lambda *a, **k: None
sys.modules.setdefault("marketing", marketing_pkg)
sys.modules.setdefault("marketing.bonuses", marketing_pkg.bonuses)
sys.modules.setdefault("marketing.qualifications", marketing_pkg.qualifications)
sys.modules.setdefault("marketing.manual_bonus", marketing_pkg.manual_bonus)
from main.helpers.d2o import DictObj, PersonEncoder
from main.helpers.func_creator import func_creator
from main.main import parse_timestamp


def test_dictobj_attribute_access():
    data = {"user": {"name": "Alice", "roles": ["admin", "user"]}, "id": 1}
    obj = DictObj(data)
    assert obj.id == 1
    assert obj.user.name == "Alice"
    assert obj.user.roles == ["admin", "user"]


def test_personencoder_serialization():
    data = {"value": 42}
    obj = DictObj(data)
    encoded = json.dumps(obj, cls=PersonEncoder)
    assert json.loads(encoded) == data


def test_func_creator_dynamic_loading(monkeypatch):
    module = ModuleType("pages.Dummy")

    class Dummy:
        def get(self, uid, tx_type=0, limit=10, offset=0, filter=None):
            return json.dumps({"uid": uid, "limit": limit})

    module.Dummy = Dummy

    sys.modules["pages"] = ModuleType("pages")
    sys.modules["pages.Dummy"] = module
    setattr(sys.modules["pages"], "Dummy", module)
    result = func_creator("123", json.dumps({"data": {"page": "Dummy", "limit": 5}}))
    assert result == {"Dummy": {"uid": "123", "limit": 5}}
    del sys.modules["pages.Dummy"]
    del sys.modules["pages"]


def test_parse_timestamp():
    ts = "2024-06-11 10:20:30"
    parsed = parse_timestamp(ts)
    assert parsed.year == 2024
    assert parsed.month == 6
    assert parsed.day == 11
    assert parsed.hour == 10
    assert parsed.minute == 20
    assert parsed.second == 30
