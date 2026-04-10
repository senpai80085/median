import os
import uuid
import json
import shutil
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from backend.services.hash_service import generate_phash
from backend.services.embedding_service import generate_embedding
from backend.database.db import get_db
from backend.models.schemas import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=UploadResponse)
async def upload_media(file: UploadFile = File(...)):
    # ── Validate ─────────────────────────────────────────────
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    media_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    save_filename = f"{media_id}{file_extension}"
    save_path = os.path.join(UPLOAD_DIR, save_filename)

    # ── Save to disk ─────────────────────────────────────────
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # ── Generate pHash (always) ──────────────────────────────
    try:
        phash = generate_phash(save_path)
    except Exception as e:
        os.remove(save_path)
        raise HTTPException(status_code=400, detail=f"Failed to process image hash: {e}")

    # ── Generate Vertex AI embedding (best-effort) ───────────
    embedding_json = None
    try:
        embedding = generate_embedding(save_path)
        if embedding:
            embedding_json = json.dumps(embedding)
            logger.info("Vertex AI embedding stored for %s (%d dims)", media_id, len(embedding))
    except Exception as e:
        logger.warning("Embedding generation failed for %s, continuing with pHash only: %s", media_id, e)

    # ── Persist to database ──────────────────────────────────
    try:
        with get_db() as db:
            db.execute(
                "INSERT INTO media (id, file_path, phash, embedding_vector) VALUES (?, ?, ?, ?)",
                (media_id, save_path, phash, embedding_json)
            )
            db.commit()
    except Exception as e:
        os.remove(save_path)
        raise HTTPException(status_code=500, detail="Database insertion failed.")

    # ── Build labels ─────────────────────────────────────────
    labels = ["uploaded"]
    if embedding_json:
        labels.append("ai-embedded")
    else:
        labels.append("phash-only")

    return UploadResponse(
        media_id=media_id,
        file_path=save_path,
        labels=labels,
        message="Upload processed successfully."
    )
