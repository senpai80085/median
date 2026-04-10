from PIL import Image
import io

def test_upload_success(client):
    """Test standard image upload flow dynamically rendering a mock image byte stream."""
    # Construct an in-memory image
    img = Image.new('RGB', (50, 50), color='green')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    # Perform Upload
    response = client.post(
        "/upload",
        files={"file": ("test_green.jpg", img_byte_arr, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()
    assert "media_id" in data
    assert "file_path" in data
    assert data["message"] == "Upload processed successfully."
    assert data["labels"] == ["uploaded", "local", "unlabeled"]

def test_upload_invalid_type(client):
    """Test uploading non-image data gracefully hits the 400 rejection wall."""
    response = client.post(
        "/upload",
        files={"file": ("malicious.txt", b"I am definitely a virus disguised as text.", "text/plain")}
    )
    
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid file type. Only images are allowed."}
