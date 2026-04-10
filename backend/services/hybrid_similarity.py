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
PHASH_WEIGHT = 0.4
EMBEDDING_WEIGHT = 0.6
TOP_K = 5
UNAUTHORIZED_THRESHOLD = 0.8   # > 0.8 → "Unauthorized"


# ── Data structures ──────────────────────────────────────────
@dataclass
class ScanMatch:
    """Result of the hybrid similarity scan."""
    matched_id: Optional[str]
    final_score: float              # 0.0 – 1.0
    phash_score: float
    embedding_score: Optional[float]
    status: str                     # "Unauthorized" | "Safe" | "No Match"


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


def _parse_embedding(raw: Optional[str]) -> Optional[List[float]]:
    """Safely deserialize a JSON-encoded embedding vector from SQLite."""
    if not raw:
        return None
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
    with get_db() as db:
        target = db.execute(
            "SELECT id, phash, embedding_vector FROM media WHERE id = ?",
            (target_id,),
        ).fetchone()

        if not target:
            raise ValueError(f"Media {target_id} not found")

        target_phash = target["phash"]
        target_embedding = _parse_embedding(target["embedding_vector"])

        # ── 2. pHash sweep ───────────────────────────────────
        candidates = db.execute(
            "SELECT id, phash, embedding_vector FROM media WHERE id != ?",
            (target_id,),
        ).fetchall()

    if not candidates:
        return ScanMatch(
            matched_id=None,
            final_score=0.0,
            phash_score=0.0,
            embedding_score=None,
            status="No Match",
        )

    # Score every candidate by pHash
    scored = []
    for row in candidates:
        p_score = phash_score(target_phash, row["phash"])
        scored.append((row, p_score))

    # Sort descending and take top-K
    scored.sort(key=lambda x: x[1], reverse=True)
    top_k = scored[:TOP_K]

    # ── 3 & 4. Embedding similarity + blend ──────────────────
    best_id = None
    best_final = -1.0
    best_phash = 0.0
    best_emb = None

    for row, p_sc in top_k:
        candidate_embedding = _parse_embedding(row["embedding_vector"])

        if target_embedding and candidate_embedding:
            e_sc = _cosine_similarity(target_embedding, candidate_embedding)
            final = (PHASH_WEIGHT * p_sc) + (EMBEDDING_WEIGHT * e_sc)
            emb_score = e_sc
        else:
            # Fallback: pHash only (full weight)
            final = p_sc
            emb_score = None

        if final > best_final:
            best_final = final
            best_id = row["id"]
            best_phash = p_sc
            best_emb = emb_score

    # ── 5. Determine status ──────────────────────────────────
    best_final = max(0.0, min(1.0, best_final))

    if best_final > UNAUTHORIZED_THRESHOLD:
        status = "Unauthorized"
    else:
        status = "Safe"

    logger.info(
        "Hybrid scan: target=%s best=%s final=%.3f (phash=%.3f, emb=%s)",
        target_id, best_id, best_final, best_phash,
        f"{best_emb:.3f}" if best_emb is not None else "N/A",
    )

    return ScanMatch(
        matched_id=best_id,
        final_score=best_final,
        phash_score=best_phash,
        embedding_score=best_emb,
        status=status,
    )
