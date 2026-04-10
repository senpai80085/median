import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.routes.upload import router as upload_router
from backend.routes.scan import router as scan_router
from backend.routes.media import router as media_router

app = FastAPI(title="Median - AI Media Guardian API")

# Setup CORS to allow the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL (e.g. "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, tags=["upload"])
app.include_router(scan_router, tags=["scan"])
app.include_router(media_router, tags=["media"])

@app.get("/")
def read_root():
    return {"message": "Median Backend Running"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
