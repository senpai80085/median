import sqlite3
import os
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "median.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        # Original table creation
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media (
                id TEXT PRIMARY KEY,
                file_path TEXT NOT NULL,
                phash TEXT NOT NULL,
                upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

        # Migration: add embedding_vector column if it doesn't exist.
        # SQLite doesn't have IF NOT EXISTS for ALTER TABLE,
        # so we check the schema first.
        cursor.execute("PRAGMA table_info(media)")
        columns = [row[1] for row in cursor.fetchall()]

        if "embedding_vector" not in columns:
            cursor.execute("ALTER TABLE media ADD COLUMN embedding_vector TEXT")
            conn.commit()
            logger.info("Migration applied: added 'embedding_vector' column to media table.")

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Ensure the DB schema is created on import (to be simple)
init_db()
