"""
Hybrid Similarity Engine.

Combines two complementary signals into a single similarity score:

  1. pHash  (fast, pixel-structure)  — weight 0.4
  2. Vertex AI embedding (semantic)  — weight 0.6

Pipeline:
  → pHash sweep over ALL candidates   (O(N), but hashes are tiny strings)
  → Keep top-K by pHash score         (default K=5)
  → Cosine-similarity on embeddings   (only K comparisons, not N)
  → Weighted blend → final score

Graceful degradation:
  If embeddings are missing for either image, falls back to pHash-only (weight 1.0).
"""
import json
import logging
import math
from dataclasses import dataclass
from typing import List, Optional

from backend.services.similarity_service import calculate_similarity_score as phash_score
from backend.database.db import get_db

logger = logging.getLogger(__name__)

# ── Tuning knobs ─────────────────────────────────────────────
PHASH_WEIGHT = 0.3          # Reduced — pHash is less reliable for cropped images
EMBEDDING_WEIGHT = 0.7      # Increased — semantic signal is crop-tolerant
TOP_K_PHASH = 15            # Top candidates by pHash structure
EMBEDDING_FALLBACK_CAP = 20 # Always compare embeddings for up to this many candidates


# ── Data structures ──────────────────────────────────────────
@dataclass
class ScanMatch:
    """Result of the hybrid similarity scan."""
    matched_id: Optional[str]
    final_score: float              # 0.0 – 1.0
    phash_score: float
    embedding_score: Optional[float]
    status: str                     # "Unauthorized" | "Safe" | "No Match" | "Review"
    confidence: str                 # "High" | "Medium" | "Low"


# ── Math helpers ─────────────────────────────────────────────
def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """
    Compute cosine similarity between two vectors.
    Returns 0.0 – 1.0  (clamped; embeddings are typically non-negative).
    """
    if len(a) != len(b) or len(a) == 0:
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))

    if mag_a == 0 or mag_b == 0:
        return 0.0

    sim = dot / (mag_a * mag_b)
    return max(0.0, min(1.0, sim))


def _parse_embedding(raw) -> Optional[List[float]]:
    """Safely deserialize a JSON-encoded embedding vector."""
    if not raw:
        return None
    if isinstance(raw, list):
        return raw if len(raw) > 0 else None
    try:
        vec = json.loads(raw)
        if isinstance(vec, list) and len(vec) > 0:
            return vec
    except (json.JSONDecodeError, TypeError):
        pass
    return None


# ── Public API ───────────────────────────────────────────────
def hybrid_scan(target_id: str) -> ScanMatch:
    """
    Run the full hybrid similarity pipeline for a given media ID.

    Steps:
      1. Load the target row (phash + embedding).
      2. pHash-sweep all other rows, keep top-K.
      3. Cosine-similarity on embeddings for the top-K.
      4. Blend scores.
      5. Return best match with status.
    """

    # ── 1. Load target ───────────────────────────────────────
    db = get_db()
    
    target_doc = db.collection("media").document(target_id).get()
    if not target_doc.exists:
        raise ValueError(f"Media {target_id} not found")

    target = target_doc.to_dict()
    target_phash = target.get("phash")
    target_embedding = _parse_embedding(target.get("embedding_vector"))

    # ── 2. pHash sweep ───────────────────────────────────
    # We fetch all candidates from Firestore
    # Instead of 'WHERE id != ?', we stream all and filter in Python
    all_docs = db.collection("media").stream()
    candidates = []
    for doc in all_docs:
        if doc.id != target_id:
            row = doc.to_dict()
            row["id"] = doc.id
            candidates.append(row)

    if not candidates:
        return ScanMatch(
            matched_id=None,
            final_score=0.0,
            phash_score=0.0,
            embedding_score=None,
            status="No Match",
            confidence="Low",
        )

    # Score every candidate by pHash
    scored = []
    for row in candidates:
        p_score = phash_score(target_phash, row["phash"])
        scored.append((row, p_score))

    # Sort descending by pHash score
    scored.sort(key=lambda x: x[1], reverse=True)

    # Two-layer shortlist:
    # Layer 1: top-K by pHash (catches structurally similar images)
    top_by_phash = set(r[0]["id"] for r in scored[:TOP_K_PHASH])

    # Layer 2: always include all candidates WITH an embedding vector,
    #   up to EMBEDDING_FALLBACK_CAP — catches cropped/edited versions
    #   where pHash is low but semantic content is similar
    embedded_candidates = [r for r in scored if r[0].get("embedding_vector")]
    top_by_embedding = set(r[0]["id"] for r in embedded_candidates[:EMBEDDING_FALLBACK_CAP])

    # Union of both layers — deduplicated
    top_k = [r for r in scored if r[0]["id"] in top_by_phash | top_by_embedding]

    # ── 3 & 4. Embedding similarity + blend ──────────────────
    best_id = None
    best_final = -1.0
    best_phash = 0.0
    best_emb = None
    best_status = "Safe"
    best_confidence = "Low"

    for row, p_sc in top_k:
        candidate_embedding = _parse_embedding(row.get("embedding_vector"))

        if target_embedding and candidate_embedding:
            e_sc = _cosine_similarity(target_embedding, candidate_embedding)
            final = (PHASH_WEIGHT * p_sc) + (EMBEDDING_WEIGHT * e_sc)

            # Confidence from semantic score (most reliable signal)
            if e_sc > 0.85:
                confidence = "High"
            elif e_sc > 0.70:
                confidence = "Medium"
            else:
                confidence = "Low"

            # Classification — embedding is primary, pHash confirms
            if e_sc > 0.78:
                status = "Unauthorized"   # Semantic match regardless of pHash
            elif p_sc > 0.85:
                status = "Unauthorized"   # Structural duplicate
            elif final > 0.65:
                status = "Review"         # Likely edited/cropped copy
            elif final < 0.40:
                status = "Safe"
            else:
                status = "Review"
                
            emb_score = e_sc
        else:
            # Fallback: pHash only (full weight)
            final = p_sc
            emb_score = None
            confidence = "Low"
            
            if p_sc > 0.85:
                status = "Unauthorized"
            elif p_sc > 0.65:
                status = "Review"
            else:
                status = "Safe"

        if final > best_final:
            best_final = final
            best_id = row["id"]
            best_phash = p_sc
            best_emb = emb_score
            best_status = status
            best_confidence = confidence

    # If the score is extremely low, it's just random noise, so discard the match
    if best_final < 0.25:
        best_id = None
        best_final = 0.0
        best_phash = 0.0
        best_emb = 0.0 if best_emb is not None else None
        best_status = "Safe"
        best_confidence = "Low"

    logger.info(
        "Hybrid scan: target=%s best=%s final=%.3f (phash=%.3f, emb=%s, status=%s, conf=%s)",
        target_id, best_id, best_final, best_phash,
        f"{best_emb:.3f}" if best_emb is not None else "N/A",
        best_status, best_confidence
    )

    return ScanMatch(
        matched_id=best_id,
        final_score=best_final,
        phash_score=best_phash,
        embedding_score=best_emb,
        status=best_status,
        confidence=best_confidence,
    )
