import sqlite3
import json
from contextlib import contextmanager
from backend.app.config import settings

def init_db():
    """Initialize SQLite database schema."""
    conn = sqlite3.connect(str(settings.DATABASE_PATH))
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        report_id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        model_name TEXT,
        created_at TEXT NOT NULL,
        overall_reliability REAL,
        hallucination_risk REAL,
        summary_counts TEXT,
        score_breakdown TEXT,
        explanation TEXT,
        raw_json TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS claims (
        claim_id TEXT NOT NULL,
        report_id TEXT NOT NULL,
        claim_text TEXT NOT NULL,
        claim_type TEXT NOT NULL,
        importance REAL,
        requires_verification INTEGER,
        verdict TEXT,
        confidence REAL,
        PRIMARY KEY (report_id, claim_id),
        FOREIGN KEY (report_id) REFERENCES reports (report_id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence (
        evidence_id TEXT NOT NULL,
        report_id TEXT NOT NULL,
        claim_id TEXT NOT NULL,
        source_title TEXT,
        source_url TEXT,
        source_domain TEXT,
        source_type TEXT,
        snippet TEXT,
        relevance REAL,
        source_quality_score REAL,
        PRIMARY KEY (report_id, evidence_id),
        FOREIGN KEY (report_id) REFERENCES reports (report_id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()


@contextmanager
def get_db():
    """Context manager for SQLite connection with row factory."""
    conn = sqlite3.connect(str(settings.DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
