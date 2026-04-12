"""
Gemini Explanation Service.

Uses Google's Gemini model to generate human-readable, non-hallucinated
explanations for why two images were flagged as similar or safe.

Graceful degradation: if the Gemini API is unreachable, returns a
deterministic template-based explanation instead.
"""
import logging
import time
from typing import Optional

from google import genai
from google.genai import types
from PIL import Image

from backend.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GEMINI_MODEL

logger = logging.getLogger(__name__)

# ── Gemini Client ─────────────────────────────────────────────
_client = None

def _get_client():
    """Lazy-initialize the Gemini client once."""
    global _client
    if _client is None:
        _client = genai.Client(
            vertexai=True,
            project=GOOGLE_CLOUD_PROJECT,
            location=GOOGLE_CLOUD_LOCATION,
        )
        logger.info("Gemini client initialized (project=%s, model=%s)",
                     GOOGLE_CLOUD_PROJECT, GEMINI_MODEL)
    return _client


# ── Fallback explanation (no API needed) ─────────────────────
def _fallback_explanation() -> str:
    return "AI analysis unavailable. Similarity determined using computed features."


# ── Public API ───────────────────────────────────────────────
def generate_explanation(
    target_path: Optional[str] = None,
    match_path: Optional[str] = None,
) -> str:
    """
    Generate a human-readable explanation for a scan result using multimodal Gemini.
    """
    if not target_path or not match_path:
        return _fallback_explanation()

    prompt = (
        "You are a digital rights analyst. Carefully compare these two images and provide a structured analysis:\n\n"
        "1. **Subject & Objects**: What are the main subjects and objects visible in each image?\n"
        "2. **Visual Similarity**: How visually similar are they? Are they the same scene/subject?\n"
        "3. **Composition Changes**: Is there evidence of cropping, rotation, padding, or reframing?\n"
        "4. **Color & Lighting**: Compare color tones, brightness, saturation, and lighting conditions.\n"
        "5. **Editing Artifacts**: Any signs of filters, compression, watermark removal, or manipulation?\n"
        "6. **Verdict**: Based on this analysis, does this appear to be a copy or derived work?\n\n"
        "Be factual and concise in each point. Do not guess identity."
    )

    def load_image(path: str):
        if path.startswith("http://") or path.startswith("https://"):
            import requests
            import io
            response = requests.get(path, timeout=10)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content))
        return Image.open(path)

    try:
        target_img = load_image(target_path)
        match_img = load_image(match_path)
    except Exception as e:
        logger.warning(f"Could not load images for Gemini: {e}")
        return _fallback_explanation()

    client = _get_client()

    for attempt in range(2):
        try:
            # We add a basic timeout context if the SDK supports it, or rely on normal timeout.
            # The python SDK typically enforces timeouts inside GenerateContentConfig if needed,
            # or relies on urllib3/grpc timeouts. We'll stick to the retry loop.
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[prompt, target_img, match_img],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=400,
                ),
            )
            explanation = response.text.strip()
            logger.info("Gemini explanation generated (%d chars)", len(explanation))
            return explanation
        except Exception as e:
            logger.warning("Gemini API call failed (attempt %d): %s", attempt + 1, e)
            if attempt == 1:
                return _fallback_explanation()
            time.sleep(1)

    return _fallback_explanation()
