<div align="center">
  <h1>🛡️ Median: AI Media Guardian</h1>
  <p><strong>A hybrid AI-powered system designed to protect intellectual property and detect unauthorized media clones.</strong></p>
</div>

---

## 🏆 What is Median?

Median is an enterprise-grade media similarity engine designed to stop copyright infringement, deepfakes, and unauthorized asset usage.

Instead of relying on basic metadata, **Median uses a multi-layered AI pipeline to "look" at an image and understand its structure and meaning.**

### 🧠 The Hybrid AI Architecture
Median solves the massive computational cost of similarity searches by blending traditional perceptual hashing with modern Deep Learning:

1. **Velocity Layer (pHash):** Evaluates exact perceptual similarity of an image in `O(N)` time. This acts as an ultra-fast pre-filter, dropping the search space down to the top 5 candidates.
2. **Semantic Layer (Vertex AI Multimodal Embeddings):** Generates a 1408-dimensional vector representing the core "meaning" and visual style of the image. A cosine distance calculation is performed against the top candidates.
3. **Reasoning Layer (Gemini 2.0 Flash):** Evaluates the blended scores and securely generates a human-readable explanation of *why* an image is flagged as "Unauthorized" or "Safe".

## 🚀 Key Features for Judges

* **Graceful Degradation:** Built for production. If Google AI APIs timeout or fail, the system instantly falls back to pHash-only matching, ensuring zero downtime.
* **Deterministic Output:** Uses prompt-engineering and temperature controls on Gemini to prevent AI hallucinations, ensuring the "explanations" are strictly grounded in mathematical confidence scores.
* **Scalable Pipeline:** Uses top-K approximate filtering before running heavy vector math.
* **Oversized Payload Guards:** Built-in network middleware rejecting files >10MB at the border line to protect backend memory.

---

## 💻 Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, TypeScript
* **Backend:** Python, FastAPI, SQLite (Local Data Storage)
* **AI & Cloud Services:** 
   * **Google Cloud Vertex AI:** `multimodalembedding@001`
   * **Google Generative AI:** `gemini-2.0-flash`
   * **pHash (ImageHash):** Structural filtering

---

## 🛠️ How to Run Locally

### 1. Backend Setup (FastAPI & Google AI)
Ensure you have Python 3.10+ installed. You will need a Google Cloud Project with the **Vertex AI API** enabled.

```bash
# Navigate to backend
cd backend

# Create virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # (On Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

> **🔑 Authentication Details:**
> Create a `.env` file in the `backend/` directory:
> ```env
> GOOGLE_APPLICATION_CREDENTIALS=../key.json
> GOOGLE_CLOUD_PROJECT=your-project-id
> GEMINI_MODEL=gemini-2.0-flash
> MAX_UPLOAD_SIZE=10485760
> ```
> *(Ensure your GCP `key.json` is sitting in the root folder!)*

Run the backend server:
```bash
python main.py
```
*The backend will boot up at `http://localhost:8000` with full Swagger docs available at `/docs`.*

### 2. Frontend Setup (React / Vite)
Open a new terminal.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
*The frontend will be available at `http://localhost:8080` (or the port defined by Vite).*

---

## 🤔 How it Works (A User Journey)

1. A creator uploads an original artwork (e.g., *a drawing of a sci-fi city*). 
2. Median processes it in milliseconds, extracting the pHash and Vertex AI Embedding, and indexing it into the database.
3. A bad actor crops, slightly recolors, or alters the same artwork and attempts to upload it.
4. Median scans the file. The pHash triggers a structural warning, while Vertex AI flags a 99% semantic match.
5. Gemini Flash compiles this data and throws an **Unauthorized** alert with a detailed summary. The bad actor is blocked.
