"""
Vertex AI Image Embedding Service.

Uses Google's multimodal embedding model to convert images into
high-dimensional vectors that capture semantic visual meaning.
These vectors power the "deep similarity" layer of the hybrid engine.

Graceful degradation: if Vertex AI is unreachable, returns None
so the system can fall back to pHash-only matching.
"""
import os
import time
import logging
from typing import Optional, List

import vertexai
from vertexai.vision_models import MultiModalEmbeddingModel, Image as VertexImage

from backend.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION

logger = logging.getLogger(__name__)

# ── Vertex AI Initialization ──────────────────────────────────
_initialized = False

def _ensure_init():
    """Lazy-initialize the Vertex AI SDK once."""
    global _initialized
    if not _initialized:
        vertexai.init(
            project=GOOGLE_CLOUD_PROJECT,
            location=GOOGLE_CLOUD_LOCATION,
        )
        _initialized = True
        logger.info("Vertex AI SDK initialized (project=%s, location=%s)",
                     GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION)


# ── Public API ────────────────────────────────────────────────
def generate_embedding(image_path: str, max_retries: int = 2) -> Optional[List[float]]:
    """
    Generate a 1408-dimensional embedding vector for an image.

    Args:
        image_path: Absolute path to a local image file.
        max_retries: Number of retry attempts on transient failures.

    Returns:
        A list of floats representing the image embedding,
        or None if the service is unavailable.
    """
    if not os.path.exists(image_path):
        logger.error("Image file not found: %s", image_path)
        return None

    _ensure_init()

    model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding@001")
    image = VertexImage.load_from_file(image_path)

    for attempt in range(1, max_retries + 1):
        try:
            embeddings = model.get_embeddings(image=image)
            vector = embeddings.image_embedding
            logger.info("Embedding generated (%d dims) for %s", len(vector), image_path)
            return vector
        except Exception as e:
            logger.warning("Vertex AI attempt %d/%d failed: %s", attempt, max_retries, e)
            if attempt < max_retries:
                time.sleep(1.5 * attempt)  # simple backoff

    logger.error("Vertex AI embedding failed after %d attempts for %s", max_retries, image_path)
    return None
