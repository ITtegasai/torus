import asyncio
import asyncio
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "main"))
sys.path.insert(0, str(ROOT))

import types
fake_db = types.ModuleType("db.db")
class DummyConnection:
    def select(self, *a, **k):
        return {"result": []}
    def disconnect(self):
        pass
    def updateFromStr(self, *a, **k):
        pass
fake_db.Connection = DummyConnection
sys.modules.setdefault("db", types.ModuleType("db"))
sys.modules["db.db"] = fake_db

spec = importlib.util.spec_from_file_location(
    "main_main", ROOT / "main" / "main.py")
main_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main_module)

ConnectionManager = main_module.ConnectionManager
clients = main_module.clients

class FakeWebSocket:
    def __init__(self):
        self.accepted = False
        self.sent = []
        self.client_state = "CONNECTED"

    async def accept(self):
        self.accepted = True

    async def send_text(self, message: str):
        self.sent.append(message)


async def run_manager():
    manager = ConnectionManager()
    ws = FakeWebSocket()
    await manager.connect(ws, "uid1", 1)
    assert ws in manager.active_connections
    assert "uid1" in clients
    await manager.send_personal_message("hello", ws)
    assert ws.sent == ["hello"]
    manager.disconnect(ws, "uid1")
    assert ws not in manager.active_connections
    assert "uid1" not in clients


def test_connection_manager_event_loop():
    asyncio.get_event_loop().run_until_complete(run_manager())