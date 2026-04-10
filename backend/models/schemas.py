from pydantic import BaseModel
from typing import List, Optional

class MediaItem(BaseModel):
    media_id: str
    file_path: str
    labels: List[str]
    has_embedding: bool

class UploadResponse(BaseModel):
    media_id: str
    file_path: str
    labels: List[str]
    message: str

class ScanRequest(BaseModel):
    media_id: str

class ScanResponse(BaseModel):
    similarity_score: float # 0.0 to 1.0 expected by frontend
    status: str # "Unauthorized" | "Safe" | "No Match"
    matched_id: Optional[str] = None
    ai_explanation: str
