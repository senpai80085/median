# Roadmap

## Phase 1: Test Integration
- Implement `pytest` for backend coverage logic
- Test core domain `services` mathematically

## Phase 2: Router Integration Testing
- Write endpoint integration tests using `TestClient` for FastAPI
- Ensure SQLite mock databases rollback correctly after testing

## Phase 3: E2E Frontend Tests
- Create standard Playwright workflows for uploading logic
- Create standard Playwright workflows for scanning logic

## Phase 4: Vector Index Restructure
- Research FAISS vs PGVector for localized offline similarity embeddings
- Execute migration of SQLite to standard Vector format
