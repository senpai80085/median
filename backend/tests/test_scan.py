from backend.database.db import get_db

def test_scan_not_found(client):
    """Test scanning a media ID that doesn't exist."""
    response = client.post("/scan", json={"media_id": "ghost_id"})
    assert response.status_code == 404
    assert response.json() == {"detail": "Media not found."}

def test_scan_no_match(client):
    """Test scanning when only the target image is in the database."""
    # Seed DB
    with get_db() as db:
        db.execute(
            "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
            ("mock_uuid_target", "/tmp/uploads/target.jpg", "e305e22ecf6b0f0f")
        )
        db.commit()
        
    response = client.post("/scan", json={"media_id": "mock_uuid_target"})
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "No Match"
    assert data["similarity_score"] == 0.0
    assert data["matched_id"] is None
    assert "no other images" in data["ai_explanation"]

def test_scan_unauthorized_high_similarity(client):
    """Test scanning correctly trips an Unauthorized status with multiple images in the database."""
    with get_db() as db:
        # Source image
        db.execute(
            "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
            ("target_uuid", "/tmp/target.jpg", "e305e22ecf6b0f0f")
        )
        
        # Unauthorized extremely similar image (1 byte difference)
        db.execute(
            "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
            ("thief_uuid", "/tmp/thief.jpg", "e305e22ecf6b0f0a") # Distance = 2
        )
        
        # Completely different image (Safe distance check)
        db.execute(
            "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
            ("safe_uuid", "/tmp/safe.jpg", "ffffffffffffffff")
        )
        db.commit()

    response = client.post("/scan", json={"media_id": "target_uuid"})
    assert response.status_code == 200
    data = response.json()
    
    # Distance is 2. Math is: 100 - (2 * 5) = 90 -> 0.90
    assert data["status"] == "Unauthorized"
    assert data["similarity_score"] == 0.90
    assert data["matched_id"] == "thief_uuid"
    assert "high similarity" in data["ai_explanation"]
