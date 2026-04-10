import os
import uuid
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException
from backend.services.hash_service import generate_phash
from backend.database.db import get_db
from backend.models.schemas import UploadResponse

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=UploadResponse)
async def upload_media(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    media_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    save_filename = f"{media_id}{file_extension}"
    save_path = os.path.join(UPLOAD_DIR, save_filename)
    
    # Optional constraint check: limit size in memory or during stream, 
    # but simplest is saving and processing.

    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    try:
        phash = generate_phash(save_path)
    except Exception as e:
        os.remove(save_path)
        raise HTTPException(status_code=400, detail=f"Failed to process image hash: {e}")

    # Store in DB
    try:
        with get_db() as db:
            db.execute(
                "INSERT INTO media (id, file_path, phash) VALUES (?, ?, ?)",
                (media_id, save_path, phash)
            )
            db.commit()
    except Exception as e:
        os.remove(save_path)
        raise HTTPException(status_code=500, detail="Database insertion failed.")

    # Return response matching frontend expectations. 
    # Since we can't use external AI APIs, we provide mocked labels.
    mocked_labels = ["uploaded", "local", "unlabeled"]
    
    return UploadResponse(
        media_id=media_id,
        file_path=save_path,
        labels=mocked_labels,
        message="Upload processed successfully."
    )
