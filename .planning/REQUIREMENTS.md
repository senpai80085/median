# Requirements

## Epic: Test Coverage

### Backend Testing Suite
- Setup pytest environment
- Add unit tests for hash generation (`hash_service.py`)
- Add unit tests for similarity score calculations
- Add router tests for `/upload`, `/scan`, and `/media`

### E2E Testing Suite
- Establish Playwright CI tests matching `playwright.config.ts`

## Epic: Scale Backend Similarity Engine

### Vector Database Integration
- Migrate away from `100 - (diff * 5)` custom logic and O(N) database matching.
- Configure local PGVector or FAISS vector mappings to handle large sets of `phash` items efficiently.
