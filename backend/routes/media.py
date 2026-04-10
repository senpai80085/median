import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List
from backend.models.schemas import MediaItem
from backend.database.db import get_db

router = APIRouter()

@router.get("/media", response_model=List[MediaItem])
async def list_media():
    """Returns a list of all uploaded media to populate the frontend dashboard."""
    with get_db() as db:
        rows = db.execute("SELECT id, file_path, phash FROM media ORDER BY upload_time DESC").fetchall()
        
    results = []
    for row in rows:
        results.append(MediaItem(
            media_id=row["id"],
            file_path=f"/media/{row['id']}", # A frontend-accessible route
            labels=["uploaded", "local"],
            has_embedding=bool(row["phash"]) # True if phash exists
        ))
        
    return results

@router.get("/media/{media_id}")
async def get_media_file(media_id: str):
    """Serves the actual image file bytes."""
    with get_db() as db:
        row = db.execute("SELECT file_path FROM media WHERE id = ?", (media_id,)).fetchone()
        
    if not row or not os.path.exists(row["file_path"]):
        raise HTTPException(status_code=404, detail="Image file not found on server.")
        
    return FileResponse(row["file_path"])
