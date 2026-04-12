import logging
from fastapi import APIRouter, HTTPException
from backend.services.hybrid_similarity import hybrid_scan
from backend.services.gemini_service import generate_explanation
from backend.models.schemas import ScanRequest, ScanResponse
from backend.database.db import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/scan", response_model=ScanResponse)
async def scan_media(request: ScanRequest):
    target_id = request.media_id

    # ── Run hybrid similarity pipeline ───────────────────────
    try:
        result = hybrid_scan(target_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Hybrid scan failed: %s", e)
        raise HTTPException(status_code=500, detail="Scan engine error.")

    # ── Handle "No Match" early ──────────────────────────────
    if result.status == "No Match":
        return ScanResponse(
            similarity_score=result.final_score,
            status="No Match",
            matched_id=None,
            ai_explanation="There are no other images in the database to compare against.",
            confidence=getattr(result, "confidence", "Low"),
            embedding_score=result.embedding_score,
            phash_score=result.phash_score,
            combined_score=result.final_score,
        )

    # ── Fetch paths for Gemini ───────────────────────────────
    target_path = None
    match_path = None
    target_path = None
    match_path = None
    try:
        db = get_db()
        # Fetch target path
        t_doc = db.collection("media").document(target_id).get()
        if t_doc.exists:
            target_path = t_doc.to_dict().get("file_path")
            
        # Fetch matched path
        if result.matched_id:
            m_doc = db.collection("media").document(result.matched_id).get()
            if m_doc.exists:
                match_path = m_doc.to_dict().get("file_path")
    except Exception as e:
        logger.warning(f"Could not fetch paths from Firestore for Gemini: {e}")

    # ── Generate AI explanation via Gemini ────────────────────
    if not result.matched_id:
        explanation = "No matching images found with high enough similarity to warrant analysis."
    else:
        explanation = generate_explanation(target_path=target_path, match_path=match_path)

    response = ScanResponse(
        similarity_score=result.final_score,
        status=result.status,
        matched_id=result.matched_id,
        ai_explanation=explanation,
        confidence=getattr(result, "confidence", "Low"),
        embedding_score=result.embedding_score,
        phash_score=result.phash_score,
        combined_score=result.final_score,
    )

    # ── Save to scan history ──────────────────────────────────
    try:
        import datetime
        db = get_db()
        doc_data = {
            "target_id": target_id,
            "matched_id": result.matched_id,
            "status": result.status,
            "confidence": getattr(result, "confidence", "Low"),
            "combined_score": result.final_score,
            "embedding_score": result.embedding_score,
            "phash_score": result.phash_score,
            "ai_explanation": explanation,
            "scanned_at": datetime.datetime.now(datetime.UTC)
        }
        db.collection("scan_history").add(doc_data)
    except Exception as e:
        logger.warning(f"Could not save scan history: {e}")

    return response
