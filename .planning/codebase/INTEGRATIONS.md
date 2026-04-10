# Integrations

## External Services
None. The project adheres to strict constraints prohibiting external paid APIs for scanning or AI functionality.

## Internal APIs
- **Target Backend URL**: Defaults to `http://localhost:8000` via FastAPI (`VITE_API_URL`).
- **Endpoints**:
  - `GET /media`: Lists all media entries from SQLite
  - `GET /media/{id}`: Serves static raw images from `/backend/uploads`
  - `POST /upload`: Computes pHash via ImageHash and assigns mock labels
  - `POST /scan`: Performs similarity detection on pHashes (100 - (diff * 5) logic)
