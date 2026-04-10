import io
from PIL import Image
from backend.database.db import get_db

def test_list_media_empty(client):
    """Test dashboard query when database is completely empty."""
    response = client.get("/media")
    assert response.status_code == 200
    assert response.json() == []

def test_list_media_populated(client):
    """Test dashboard yields objects when records exist."""
    # Force inject a record into SQLite test environment securely
    with get_db() as db:
        db.execute(
            "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
            ("mock_uuid_123", "/tmp/uploads/123.jpg", "e305e22ecf6b0f0f")
        )
        db.commit()

    response = client.get("/media")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["media_id"] == "mock_uuid_123"
    assert data[0]["has_embedding"] is True
    assert data[0]["labels"] == ["uploaded", "local"]

def test_get_media_file_not_found(client):
    """Test attempting to get a file stream that doesn't exist returns 404."""
    response = client.get("/media/bogus_id_999")
    assert response.status_code == 404
