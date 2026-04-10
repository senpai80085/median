# Testing Strategy

## Unit Testing
- **Frontend**: Configured to use `Vitest` and `@testing-library/react`. 
- **Backend (Needed)**: Currently lacks explicit Python testing implementation. Should utilize `pytest` alongside `fastapi.testclient.TestClient`.

## E2E Testing
- Configured to use `Playwright` (`playwright.config.ts`, `playwright-fixture.ts`).
