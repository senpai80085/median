import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Load env vars before anything else
from backend.config import MAX_UPLOAD_SIZE

from backend.routes.upload import router as upload_router
from backend.routes.scan import router as scan_router
from backend.routes.media import router as media_router

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

app = FastAPI(
    title="Median - AI Media Guardian API",
    description="Hybrid AI-powered media protection using pHash + Vertex AI embeddings + Gemini reasoning.",
    version="2.0.0",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Step 8: File size guard (performance / security) ─────────
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    """Reject requests with bodies larger than MAX_UPLOAD_SIZE."""
    if request.method in ("POST", "PUT"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_UPLOAD_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024*1024)} MB."},
            )
    return await call_next(request)

# ── Routes ───────────────────────────────────────────────────
app.include_router(upload_router, tags=["upload"])
app.include_router(scan_router, tags=["scan"])
app.include_router(media_router, tags=["media"])

@app.get("/")
def read_root():
    return {
        "message": "Median Backend Running",
        "version": "2.0.0",
        "engine": "hybrid (pHash + Vertex AI + Gemini)",
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
