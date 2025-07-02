import importlib.util
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_jwt():
    spec = importlib.util.spec_from_file_location(
        "jwt_lib", ROOT / "main" / "lib" / "jwt.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module




def test_create_and_verify_jwt(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "secret")
    monkeypatch.setenv("ALGORITHM", "HS256")
    jwt_lib = load_jwt()
    token = jwt_lib.create_jwt_token({"sub": "user1"})
    data = jwt_lib.verify_jwt_token(token)
    assert data["sub"] == "user1"


def test_verify_invalid_jwt(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "secret")
    monkeypatch.setenv("ALGORITHM", "HS256")
    jwt_lib = load_jwt()
    assert jwt_lib.verify_jwt_token("invalid") is None