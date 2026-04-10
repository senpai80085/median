import pytest
import os
import sqlite3
from fastapi.testclient import TestClient

@pytest.fixture(autouse=True)
def setup_test_environment(tmp_path, monkeypatch):
    """
    Safely overrides the database and upload directories.
    Provides isolated integration testing per-cycle.
    """
    # 1. Mock the SQLite database path
    test_db_path = tmp_path / "test_median.db"
    
    # We must patch where it's imported, which specifically is inside backend.database.db
    import backend.database.db as real_db
    monkeypatch.setattr(real_db, "DB_PATH", str(test_db_path))
    
    # Explicitly run init_db since the global one in db.py hit the real db on import
    real_db.init_db()
    
    # 2. Mock the upload directory
    test_upload_dir = tmp_path / "uploads"
    os.makedirs(test_upload_dir, exist_ok=True)
    
    import backend.routes.upload as upload_module
    monkeypatch.setattr(upload_module, "UPLOAD_DIR", str(test_upload_dir))
    
    yield
    
    # tmp_path automatically cleans up via pytest execution.

@pytest.fixture
def client(setup_test_environment):
    from backend.main import app
    return TestClient(app)
