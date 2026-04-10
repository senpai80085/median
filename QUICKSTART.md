# ⏱️ Median: Quick Start Guide

Get Median up and running for your hackathon demo in under 5 minutes.

---

## 📋 Prerequisites
- **Python 3.10+** (for the AI backend)
- **Node.js 18+** or **Bun** (for the React/Vite frontend)
- **Google Cloud Project** with **Vertex AI API** enabled
- **Service Account Key (`key.json`)** with Vertex AI User / Generative AI User roles.

---

## 🛠️ 1. Environment Configuration

### Root Setup
Place your Google Cloud service account key in the project root and rename it to `key.json`.

```
median/
├── key.json         <-- Your GCP Key
├── backend/
└── ...
```

### Backend Config
Navigate to the `backend/` folder and create a `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure your variables:
```env
# Path relative to backend/main.py
GOOGLE_APPLICATION_CREDENTIALS=../key.json

# Your GCP Details
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GEMINI_MODEL=gemini-2.0-flash

# Limits
MAX_UPLOAD_SIZE=10485760
```

---

## 🚀 2. Spin Up the Services

### Start the Backend (API)
In a terminal at `d:\median\backend`:

```bash
# Create and activate venv
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install AI SDKs and Dependencies
pip install -r requirements.txt

# Launch Server
python main.py
```
> **Backend URL:** `http://localhost:8000`  
> **Swagger/Docs:** `http://localhost:8000/docs`

### Start the Frontend (UI)
In a **new** terminal at `d:\median`:

```bash
# Install packages
npm install  # or 'bun install'

# Start Vite Dev Server
npm run dev
```
> **Frontend URL:** `http://localhost:8080` (or as shown in terminal)

---

## 🧪 3. Run a Demo Flow

1. **Upload:** Go to the dashboard and upload an "Original" image. Watch the terminal logs verify the **Vertex AI Embedding** generation.
2. **The "Check":** Upload a slightly modified version (crop/filter) of that same image.
3. **Scan:** Click **"Scan for Clones"** on the modified image.
4. **The Results:**
   - **Similarity Score:** View the hybrid pHash + AI confidence score.
   - **AI Explanation:** Read the Gemini-generated reasoning on why it matched.
   - **Match ID:** See exactly which original file it flagged.

---

## 🚨 Troubleshooting
- **Authentication Error:** Ensure `key.json` is valid and the path in `backend/.env` is correct.
- **API Forbidden:** Verify **Vertex AI API** and **Generative Language API** are enabled in your GCP console.
- **Port Conflict:** If 8000 or 8080 are taken, Vite or Uvicorn will suggest alternates; ensure they match your requests.
