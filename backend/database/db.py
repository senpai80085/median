import os
import logging
from google.cloud import firestore

logger = logging.getLogger(__name__)

_db = None

def get_db():
    global _db
    if _db is None:
        project = os.getenv("GOOGLE_CLOUD_PROJECT", "median-ai")
        _db = firestore.Client(project=project)
        logger.info(f"Initialized Firestore Client for project {project}")
    return _db
