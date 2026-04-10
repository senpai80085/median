# Architecture

The system follows a fully decoupled Client-Server architecture operating entirely locally.

## Frontend (Client)
A Single Page Application (React) managing internal state and routing. It uses `react-query` to interface smoothly with backend asynchronous operations (uploading and scanning).
- Uses `shadcn/ui` for modular component design.

## Backend (Server)
A FastAPI Python backend that provides local hashing and data storage.
- File storage for uploaded artifacts in `/backend/uploads/`.
- Local SQLite database (`median.db`) for media metadata and mapping UUIDs to pHashes.
- Uploads offload file reading to Pillow, generation of pHashes, and saving to disk to keep processing local.
- Scanning utilizes an O(N) iterative comparison engine over the SQLite hashes to build similarity scores and returns dynamic pseudo-AI string generations depending on threshold values (>80% similarity trips "Unauthorized").
