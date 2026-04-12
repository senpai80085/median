import logging
from fastapi import APIRouter
from backend.database.db import get_db
from backend.models.schemas import HistoryItem
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/history", response_model=List[HistoryItem])
def get_scan_history():
    """Return the 50 most recent scan results."""
    try:
        from google.cloud import firestore
        db = get_db()
        docs = db.collection("scan_history").order_by("scanned_at", direction=firestore.Query.DESCENDING).limit(50).stream()
        
        results = []
        for doc in docs:
            item = doc.to_dict()
            item["id"] = doc.id
            # Ensure required fields exist for validation
            if "confidence" not in item: item["confidence"] = "Low"
            results.append(HistoryItem(**item))
            
        return results
    except Exception as e:
        logger.error(f"History fetch failed: {e}")
        return []
