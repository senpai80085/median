# Concerns & Tech Debt

## Active Technical Debts
1. **Model Testing Coverage**: While the backend endpoints were newly instantiated, they currently do not have a mapped `pytest` structure. 
2. **Missing Local AI Modality**: To fulfill constraints, labels are spoofed as `["uploaded", "local", "unlabeled"]` instead of hitting a classification model. If AI tagging is required entirely locally in the future, integration of something like a lightweight HuggingFace vision pipeline or OpenCV might be necessary.

## Scaling Concerns
- **Similarity Scanning**: The backend logic `similarity = 100 - (hash_diff * 5)` requires an O(N) linear scan over all images in the SQLite database to find the closest match. While acceptable for MVP volumes, it will inevitably bottleneck as the database grows. In the future this should be pushed into a vector indexing layer (like FAISS or pgvector).
