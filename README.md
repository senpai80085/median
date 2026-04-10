# Median - AI Media Guardian

Median is a localized, dual-architecture (Client-Server) application built to detect unauthorized usage of image assets using perceptive hashing algorithms. It empowers creators to protect their Intellectual Property without relying on expensive, privacy-compromising external vision APIs.

---

## 🏗️ Architecture & Tech Stack

Median uses an entirely localized pipeline ensuring zero image data is sent to external cloud APIs for processing.

### Frontend
- **React 18 & Vite**: Lightning fast component-based architecture and HMR.
- **TypeScript**: End-to-end static typing for safe, predictable UI iteration.
- **Tailwind CSS & Shadcn UI**: Utility-first atomic styling layered with accessible Radix primitives.
- **TanStack React Query**: Advanced client-side state caching, enabling smooth asynchronous polling and loading states against backend media endpoints.
- **React Router DOM**: Client-side routing mapped across three primary pages (`Index`, `Upload`, `Scan`).

### Backend
- **Python 3+ & FastAPI**: Asynchronous API architecture capable of processing incoming multipart uploads and running complex local sweeps concurrently.
- **SQLite3**: A built-in, lightweight persistence layer safely saving file mapping paths and hashes internally.
- **ImageHash & Pillow**: The core local AI component. Pillow interprets raw image byte streams, while ImageHash generates **Perceptual Hashes (pHash)** mapped directly to image pixel frequency characteristics rather than cryptographic parity.
- **pytest**: Foundational unit and router integration testing securely sandboxed using monkeypatch fixtures and temporary local file allocation models.

---

## ⚙️ How It Works (The "AI" Engine)

Median's "AI" doesn't use external LLMs. Instead, it measures Perceptual Hashes (`pHash`):
1. **Hashing Phase (`POST /upload`)**: When an image uploads, the backend algorithm calculates its visual frequencies, creating a static 64-bit string identifier. This hash is logged into SQLite.
2. **Scan Phase (`POST /scan`)**: When scanning a targeted image to find potential infringements, the system compares the target's `pHash` against every other stored `pHash`.
3. **Similarity Equation**: The engine calculates the **Hamming Distance** between two hex strings (how many bits inherently differ). The score returns dynamically: `Similarity = 100 - (Hamming_Distance * 5)`. 
   - A perfectly identical (or minorly cropped/recolored) image yields a high similarity `(> 80%)`, automatically flagging it as **Unauthorized**.
   - Entirely distinct images fall securely to 0%, marked **Safe**.

---

## 🚀 Getting Started

### 1. Starting the Backend
Ensure you have Python installed.
```bash
pip install -r backend/requirements.txt
```
Run the FastAPI Uvicorn Server:
```bash
python -m uvicorn backend.main:app --reload
```
The server will boot up at `http://localhost:8000`.

### 2. Starting the Frontend
Ensure you have Node.js / Bun installed.
```bash
npm install
npm run dev
```
The client will boot up at `http://localhost:5173`. 

---

## 🧪 Testing
The system employs `pytest` to comprehensively map mathematical bounds and assure local file system routing remains unpolluted:
```bash
python -m pytest backend/tests/ -v
```

## 📋 Roadmap State
This repository successfully executed **Phase 2**, fully integrating structural backend testing coverage. Future integrations will transition the O(N) database sweep toward highly scalable Vector indices like FAISS or PGVector.
