import logging
from fastapi import APIRouter, HTTPException
from backend.services.hybrid_similarity import hybrid_scan
from backend.services.gemini_service import generate_explanation
from backend.models.schemas import ScanRequest, ScanResponse

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
            similarity_score=0.0,
            status="No Match",
            matched_id=None,
            ai_explanation="There are no other images in the database to compare against.",
        )

    # ── Generate AI explanation via Gemini ────────────────────
    metadata = {}
    if result.embedding_score is not None:
        metadata["analysis_mode"] = "hybrid (pHash + AI embedding)"
        metadata["phash_score"] = f"{result.phash_score * 100:.1f}%"
        metadata["embedding_score"] = f"{result.embedding_score * 100:.1f}%"
    else:
        metadata["analysis_mode"] = "pHash only (embeddings unavailable)"

    explanation = generate_explanation(
        similarity_score=result.final_score,
        status=result.status,
        metadata=metadata,
    )

    return ScanResponse(
        similarity_score=result.final_score,
        status=result.status,
        matched_id=result.matched_id,
        ai_explanation=explanation,
    )
