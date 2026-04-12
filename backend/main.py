import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Load env vars before anything else
from backend.config import MAX_UPLOAD_SIZE

from backend.routes.upload import router as upload_router
from backend.routes.scan import router as scan_router
from backend.routes.media import router as media_router
from backend.routes.history import router as history_router

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

app = FastAPI(
    title="Median API",
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
app.include_router(history_router, tags=["history"])

@app.get("/health")
def health():
    return {"status": "ok"}

# Mount Vite's built static assets
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/")
def serve_root():
    return FileResponse("dist/index.html")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
