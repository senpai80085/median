import os
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from typing import List
from backend.models.schemas import MediaItem
from backend.database.db import get_db
from google.cloud import storage, firestore

_storage_client = None

def get_storage_bucket():
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT", "median-ai"))
    return _storage_client.bucket("median-ai-media")

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/media", response_model=List[MediaItem])
async def list_media():
    """Returns a list of all uploaded media to populate the frontend dashboard."""
    db = get_db()
    docs = db.collection("media").order_by("upload_time", direction=firestore.Query.DESCENDING).stream()
    
    results = []
    for doc in docs:
        row = doc.to_dict()
        has_emb = row.get("embedding_vector") is not None
        
        # Determine labels safely
        labels = row.get("labels", [])
        
        upload_time = row.get("upload_time")
        # Firestore Datetimes can be rendered string formats or datetime objects
        
        results.append(MediaItem(
            media_id=row.get("id"),
            file_path=row.get("file_path"),
            labels=labels,
            has_embedding=has_emb,
            upload_time=upload_time,
        ))

    return results

@router.get("/media/{media_id}")
async def get_media_file(media_id: str):
    """Redirects to the GCS public URL for an image."""
    db = get_db()
    doc = db.collection("media").document(media_id).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Image file not found.")

    file_path = doc.to_dict().get("file_path", "")
    if not file_path:
        raise HTTPException(status_code=404, detail="Image URL not stored.")

    return RedirectResponse(url=file_path, status_code=302)

@router.delete("/media/{media_id}", status_code=200)
async def delete_media(media_id: str):
    """Deletes a media entry from the database and removes its file from disk."""
    db = get_db()
    doc_ref = db.collection("media").document(media_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Media not found.")

    row = doc.to_dict()
    file_path = row.get("file_path", "")

    # Delete from Firestore
    doc_ref.delete()

    # Remove file from Cloud Storage
    if "storage.googleapis.com" in file_path:
        try:
            filename = file_path.split("/")[-1]
            bucket = get_storage_bucket()
            blob = bucket.blob(filename)
            blob.delete()
            logger.info("Deleted file from GCS: %s", filename)
        except Exception as e:
            logger.warning("Could not delete file %s from GCS: %s", file_path, e)

    logger.info("Deleted media record: %s", media_id)
    return {"message": "Media deleted successfully.", "media_id": media_id}
