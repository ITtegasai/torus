import importlib.util
from types import SimpleNamespace
from pathlib import Path
import types

ROOT = Path(__file__).resolve().parents[1]

# Prepare fake db module to avoid importing psycopg2
fake_db = types.ModuleType("db.db")
class DummyConnection:
    def select(self, *a, **k):
        return {"result": []}
    def disconnect(self):
        pass
    def updateFromStr(self, *a, **k):
        pass
fake_db.Connection = DummyConnection
import sys
sys.modules.setdefault("db", types.ModuleType("db"))
sys.modules["db.db"] = fake_db


def load_bonuses():
    class LoaderConnection(DummyConnection):
        def select(self, table, where_key="", where_value="", key="*"):
            if table == "qualifications":
                return {"result": [
                    SimpleNamespace(line_bonus='{"lines": [10,5]}'),
                    SimpleNamespace(line_bonus='{"lines": [5,3]}')
                ]}
            return super().select(table, where_key, where_value, key)

    sys.modules["db.db"].Connection = LoaderConnection
    spec = importlib.util.spec_from_file_location(
        "bonuses", ROOT / "main" / "marketing" / "bonuses.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

class FakeConnection:
    instances = []
    def __init__(self):
        self.inserts = []
        FakeConnection.instances.append(self)
    def select(self, table, where_key="", where_value="", key="*"):
        if table == "qualifications":
            return {"result": [SimpleNamespace(line_bonus='{"lines": [10,5]}'),
                                SimpleNamespace(line_bonus='{"lines": [5,3]}')]}
        if table == "user_data":
            if int(where_value) == 2:
                return {"result": SimpleNamespace(reffer_id=1)}
            if int(where_value) == 1:
                return {"result": SimpleNamespace(reffer_id=3)}
            if int(where_value) == 3:
                return {"result": SimpleNamespace(reffer_id=0)}
        if table == "users":
            val = int(where_value)
            if val == 1:
                return {"result": SimpleNamespace(id=1, uid="u1", qualification=2)}
            if val == 2:
                return {"result": SimpleNamespace(id=2, uid="u2", qualification=1)}
            if val == 3:
                return {"result": SimpleNamespace(id=3, uid="u3", qualification=2)}
        if table == "packages":
            return {"result": SimpleNamespace(bonus=True)}
        return None
    def insert(self, *args, **kwargs):
        self.inserts.append((args, kwargs))
    def update(self, *args, **kwargs):
        pass
    def selectWhereStr(self, s):
        return []
    def disconnect(self):
        pass


def test_pay_bonuses(monkeypatch):
    bonuses = load_bonuses()
    monkeypatch.setattr(bonuses, "Connection", FakeConnection)
    FakeConnection.instances.clear()
    user = SimpleNamespace(id=2, uid='u2', qualification=1)
    bonuses.pay_bonuses(user, 100, 'init')
    inserts = [ins for c in FakeConnection.instances for ins in c.inserts]
    assert inserts
    values = inserts[0][0][2]
    assert 1 in values


def test_ps_bonuses(monkeypatch):
    bonuses = load_bonuses()
    monkeypatch.setattr(bonuses, "Connection", FakeConnection)
    FakeConnection.instances.clear()
    user = SimpleNamespace(id=2, uid='u2', qualification=1)
    bonuses.ps_bonuses(user, 100, 'init')
    inserts = [ins for c in FakeConnection.instances for ins in c.inserts]
    assert len(inserts) == 2
