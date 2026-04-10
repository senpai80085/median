from fastapi import APIRouter, HTTPException
from backend.services.similarity_service import calculate_similarity_score
from backend.database.db import get_db
from backend.models.schemas import ScanRequest, ScanResponse

router = APIRouter()

@router.post("/scan", response_model=ScanResponse)
async def scan_media(request: ScanRequest):
    target_id = request.media_id
    
    # 1. Retrieve the target media
    with get_db() as db:
        target_row = db.execute("SELECT * FROM media WHERE id = ?", (target_id,)).fetchone()
        
        if not target_row:
            raise HTTPException(status_code=404, detail="Media not found.")
            
        target_hash = target_row["phash"]
        
        # 2. Compare against all other media
        # In a production system, you wouldn't pull all rows, but this is an MVP MVP O(N) scan.
        all_media = db.execute("SELECT id, phash FROM media WHERE id != ?", (target_id,)).fetchall()
        
    if not all_media:
        return ScanResponse(
            similarity_score=0.0,
            status="No Match",
            matched_id=None,
            ai_explanation="There are no other images in the database to compare against."
        )

    best_match_id = None
    highest_similarity = -1.0

    for media in all_media:
        score = calculate_similarity_score(target_hash, media["phash"])
        if score > highest_similarity:
            highest_similarity = score
            best_match_id = media["id"]

    # Threshold for unauthorized is > 80% (which means > 0.8)
    if highest_similarity > 0.8:
        status = "Unauthorized"
        explanation = f"We detected a high similarity ({(highest_similarity * 100):.1f}%) with an existing asset in our database. This constitutes a potential copyright infringement."
    else:
        status = "Safe"
        explanation = f"The image appears to be unique. The closest match had a similarity of only {(highest_similarity * 100):.1f}%, which is within acceptable safety limits."

    return ScanResponse(
        similarity_score=highest_similarity,
        status=status,
        matched_id=best_match_id,
        ai_explanation=explanation
    )
