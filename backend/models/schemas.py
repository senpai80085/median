from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MediaItem(BaseModel):
    media_id: str
    file_path: str
    labels: List[str]
    has_embedding: bool
    upload_time: Optional[datetime] = None

class UploadResponse(BaseModel):
    media_id: str
    file_path: str
    labels: List[str]
    message: str
    upload_time: Optional[datetime] = None

class ScanRequest(BaseModel):
    media_id: str

class ScanResponse(BaseModel):
    similarity_score: float # 0.0 to 1.0 expected by frontend
    status: str # "Unauthorized" | "Safe" | "No Match" | "Review"
    matched_id: Optional[str] = None
    ai_explanation: str
    confidence: Optional[str] = None
    embedding_score: Optional[float] = None
    phash_score: Optional[float] = None
    combined_score: Optional[float] = None

class HistoryItem(BaseModel):
    id: str
    target_id: str
    matched_id: Optional[str] = None
    status: str
    confidence: str
    combined_score: float
    embedding_score: Optional[float] = None
    phash_score: Optional[float] = None
    ai_explanation: str
    scanned_at: datetime
