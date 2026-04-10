# Coding Conventions

## TypeScript / Frontend
- Functional React components exclusively.
- Use explicit types/interfaces for API contracts (e.g., `MediaItem`, `ScanResponse`).
- Use `TailwindMerge` (`cn` utility) for dynamic classNames in UI components.
- Rely on `react-query` for API fetching over raw `useEffect`.

## Python / Backend
- Use FastAPI routers for modularity (`APIRouter()`).
- Utilize Pydantic models for request/response serialization mapping to frontend expectations.
- Separate core computation (`imagehash` generation, similarity mapping) into `/services` to keep routing lean.
- Use python's built-in contextual database generators for safe `sqlite3` transactional commits (`with get_db() as db:`).
