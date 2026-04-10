# AI Media Guardian

## What This Is
A local, secure platform to protect digital images from unauthorized use. Users upload media, which is securely processed through an internal Python FastAPI backend to strip AI vision data, generate Perceptual Hashes (pHash), and log persistence to an SQLite database. Using the React SPA frontend, users can scan any image against the database in an O(N) linear sweep to determine copyright infringement or unauthorized duplication visually through percentage-based similarity scores.

## Core Value
Security and IP protection without compromising data sovereignty by relying on external paid APIs or remote LLMs. All functionality runs heavily localized.

## Context
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind, Shadcn on the frontend. Python, FastAPI, SQLite, Pillow, ImageHash on the backend.
- **State**: The MVP architecture has been successfully built. We have a working frontend and a deployed local backend. Future iterations will focus on scaling the search mechanism and extending UI capacities.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| O(N) pHash Search | Kept the initial MVP requirement to stay out of heavy vector DB abstractions like FAISS. | Functional MVP established. |
| Fully Local Processing | The constraints stated no external paid endpoints (saving costs, increasing privacy). | Mocked AI text and local Pillow hashing. |

## Requirements

### Validated
- ✓ [Capability: Fast Media Upload] — existing
- ✓ [Capability: Local PHash processing] — existing
- ✓ [Capability: SQLite persistence layer] — existing
- ✓ [Capability: Media Similarity Scanning] — existing
- ✓ [Capability: Dashbord media sync] — existing

### Active
- [ ] Implement unit tests for FastAPI backend
- [ ] Add FAISS or pgvector for scalable retrieval (replacing O(N) sweep)
- [ ] Build end-to-end testing with Playwright

### Out of Scope
- [External LLM usage] — Explicitly prohibited by constraints.
- [Cloud media storage] — Currently local-only.

---
*Last updated: 2026-04-09 after initialization*

## Evolution
This document evolves at phase transitions and milestone boundaries.
**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
