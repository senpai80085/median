"""
Gemini Explanation Service.

Uses Google's Gemini model to generate human-readable, non-hallucinated
explanations for why two images were flagged as similar or safe.

Graceful degradation: if the Gemini API is unreachable, returns a
deterministic template-based explanation instead.
"""
import logging
from typing import Optional

from google import genai
from google.genai import types

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
def _fallback_explanation(similarity_score: float, status: str) -> str:
    """Deterministic template when Gemini is unavailable."""
    pct = similarity_score * 100
    if status == "Unauthorized":
        return (
            f"The scan detected a {pct:.1f}% structural similarity with an existing "
            f"protected asset. This level of resemblance—covering layout, color "
            f"distribution, and spatial composition—exceeds the safety threshold "
            f"and indicates potential unauthorized usage."
        )
    elif status == "No Match":
        return "No similar images were found in the database."
    else:
        return (
            f"The closest match in the database showed only {pct:.1f}% similarity, "
            f"which is well within acceptable limits. The image appears to be original."
        )


# ── Prompt Engineering ───────────────────────────────────────
_SYSTEM_PROMPT = """\
You are a digital rights analysis engine embedded inside "Median — AI Media Guardian".
Your role is to explain image similarity scan results to content creators.

Rules:
- Be factual and concise (2-3 sentences max).
- Reference the similarity percentage provided.
- Describe POSSIBLE visual reasons (structure, color, composition) — never claim certainty.
- Use professional, neutral tone suitable for a legal-adjacent context.
- Never hallucinate specific objects or content you haven't seen.
- Never mention that you are an AI or a language model.
"""

def _build_prompt(similarity_score: float, status: str, metadata: Optional[dict] = None) -> str:
    """Build the user prompt for Gemini."""
    pct = similarity_score * 100
    parts = [
        f"Scan result: {status}",
        f"Similarity score: {pct:.1f}%",
    ]
    if metadata:
        if metadata.get("target_labels"):
            parts.append(f"Target image labels: {', '.join(metadata['target_labels'])}")
        if metadata.get("match_labels"):
            parts.append(f"Matched image labels: {', '.join(metadata['match_labels'])}")
    parts.append("\nExplain this scan result to the content creator in 2-3 sentences.")
    return "\n".join(parts)


# ── Public API ───────────────────────────────────────────────
def generate_explanation(
    similarity_score: float,
    status: str,
    metadata: Optional[dict] = None,
) -> str:
    """
    Generate a human-readable explanation for a scan result.

    Args:
        similarity_score: 0.0 – 1.0 float.
        status: "Unauthorized", "Safe", or "No Match".
        metadata: Optional dict with 'target_labels' and/or 'match_labels'.

    Returns:
        A natural-language explanation string.
    """
    prompt = _build_prompt(similarity_score, status, metadata)

    try:
        client = _get_client()
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=200,
            ),
        )
        explanation = response.text.strip()
        logger.info("Gemini explanation generated (%d chars)", len(explanation))
        return explanation

    except Exception as e:
        logger.warning("Gemini API call failed, using fallback: %s", e)
        return _fallback_explanation(similarity_score, status)
