const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface MediaItem {
  media_id: string;
  file_path: string;
  labels: string[];
  has_embedding: boolean;
}

export interface UploadResponse {
  media_id: string;
  file_path: string;
  labels: string[];
  message: string;
}

export interface ScanResponse {
  similarity_score: number;
  status: "Unauthorized" | "Safe" | "No Match";
  matched_id: string | null;
  ai_explanation: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const res = await fetch(`${API_URL}/media`);
  return handleResponse<MediaItem[]>(res);
}

export async function uploadMedia(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
  return handleResponse<UploadResponse>(res);
}

export async function scanMedia(mediaId: string): Promise<ScanResponse> {
  const res = await fetch(`${API_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_id: mediaId }),
  });
  return handleResponse<ScanResponse>(res);
}
