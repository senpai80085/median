# Codebase Structure

## Frontend Core Paths
- `/src/pages/`: Main application routable views (`Index.tsx`, `Scan.tsx`, `Upload.tsx`)
- `/src/components/`: Reusable components (e.g., `Layout.tsx`)
- `/src/components/ui/`: Shadcn UI components.
- `/src/lib/`: Core utilities and API interaction definitions (`api.ts`).
- `/src/hooks/`: Custom React hooks (e.g., `use-toast.ts`).

## Backend Core Paths
- `/backend/main.py`: FastAPI instantiation, router configuration, and CORS middlewares.
- `/backend/requirements.txt`: Python package dependency list.
- `/backend/routes/`: FastAPI routers (`upload.py`, `scan.py`, `media.py`).
- `/backend/services/`: Core logic decoupled from routing (`hash_service.py`, `similarity_service.py`).
- `/backend/database/`: SQLite wrapper (`db.py`).
- `/backend/models/`: Pydantic serializations (`schemas.py`).
- `/backend/uploads/`: Blob storage configured for local deployment file holding.
