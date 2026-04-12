import os
import uuid
import json
import shutil
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import io
from backend.services.hash_service import generate_phash
from backend.services.embedding_service import generate_embedding
from backend.database.db import get_db
from backend.models.schemas import UploadResponse
from google.cloud import storage
import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── GCS Client ─────────────────────────────────────────────
_storage_client = None

def get_storage_bucket():
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT", "median-ai"))
    return _storage_client.bucket("median-ai-media")

@router.post("/upload", response_model=UploadResponse)
async def upload_media(file: UploadFile = File(...)):
    # ── Validate ─────────────────────────────────────────────
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    media_id = str(uuid.uuid4())
    
    # ── Internal Optimization Engine (Lossless WebP) ─────────
    # The image is loaded into memory, optimized, and saved exclusively as a WEBP.
    # This guarantees 100% visual accuracy (lossless), speeds up dashboard loading time 
    # (smaller file size), and reduces storage costs.
    try:
        # Read file into memory and open with Pillow
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB/RGBA if it's not already
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA")
            
        file_extension = ".webp"
        save_filename = f"{media_id}{file_extension}"
        save_path = os.path.join(UPLOAD_DIR, save_filename)
        
        # Save as 100% lossless WebP
        image.save(save_path, format="WEBP", lossless=True, quality=100)
        logger.info(f"Losslessly optimized image {media_id} into WebP format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize and save file: {e}")

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

    # ── Upload to Google Cloud Storage ───────────────────────
    try:
        bucket = get_storage_bucket()
        blob = bucket.blob(save_filename)
        blob.upload_from_filename(save_path, content_type="image/webp")
        gcs_url = f"https://storage.googleapis.com/{bucket.name}/{save_filename}"
        logger.info("Uploaded to GCS: %s", gcs_url)
    except Exception as e:
        logger.error(f"GCS Upload failed: {e}")
        os.remove(save_path)
        raise HTTPException(status_code=500, detail="Failed to upload image to Cloud Storage.")
    finally:
        # Always clean up the local temp file — Cloud Run has ephemeral local disk
        if os.path.exists(save_path):
            try:
                os.remove(save_path)
            except OSError:
                pass

    # ── Persist to Cloud Firestore ───────────────────────────
    try:
        db = get_db()
        upload_time = datetime.datetime.now(datetime.UTC)
        
        # Build document data
        labels = ["uploaded"]
        if embedding_json:
            labels.append("ai-embedded")
        else:
            labels.append("phash-only")

        doc_data = {
            "id": media_id,
            "file_path": gcs_url,
            "phash": phash,
            "embedding_vector": embedding_json,
            "labels": labels,
            "upload_time": upload_time
        }
        db.collection("media").document(media_id).set(doc_data)
        logger.info("Saved metadata to Firestore for %s", media_id)
            
    except Exception as e:
        logger.error(f"Firestore insertion failed: {e}")
        raise HTTPException(status_code=500, detail="Database insertion failed.")

    return UploadResponse(
        media_id=media_id,
        file_path=gcs_url,
        labels=labels,
        message="Upload processed successfully.",
        upload_time=upload_time
    )
