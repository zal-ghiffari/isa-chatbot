"""
Database module — SQLite setup and operations.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "survey.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS respondents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            institution TEXT,
            province TEXT DEFAULT '',
            city TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            question_text TEXT NOT NULL,
            scale_1 TEXT DEFAULT '',
            scale_2 TEXT DEFAULT '',
            scale_3 TEXT DEFAULT '',
            scale_4 TEXT DEFAULT '',
            order_num INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            respondent_id INTEGER NOT NULL REFERENCES respondents(id),
            question_id INTEGER NOT NULL REFERENCES questions(id),
            score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 4),
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            respondent_id INTEGER NOT NULL REFERENCES respondents(id) UNIQUE,
            total_score REAL NOT NULL,
            grade TEXT NOT NULL,
            se_score REAL DEFAULT 0,
            nc_score REAL DEFAULT 0,
            se_avg REAL DEFAULT 0,
            nc_avg REAL DEFAULT 0,
            completed_at TEXT DEFAULT (datetime('now','localtime'))
        );
    """)

    conn.commit()
    conn.close()


def seed_questions():
    """Seed default questions if empty."""
    conn = get_connection()
    cur = conn.cursor()
    count = cur.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    if count > 0:
        conn.close()
        return

    questions = [
        # === REKAYASA SOSIAL (10 questions) ===
        ("social_engineering",
         "Apakah Anda mengetahui apa yang dimaksud dengan rekayasa sosial (social engineering)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui definisi dan beberapa bentuk praktiknya",
         "Saya mengetahui definisi dan seluruh bentuk praktiknya"),

        ("social_engineering",
         "Apakah Anda mengetahui bentuk-bentuk praktik rekayasa sosial?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik phishing dalam rekayasa sosial?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik pretexting (pemalsuan identitas)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik baiting (iming-iming)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik quid pro quo (timbal balik)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik tailgating (ikut masuk area terbatas)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui teknik spear phishing (phishing tertarget)?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya",
         "Saya mengetahui bentuk praktiknya hanya pada beberapa media",
         "Saya mengetahui bentuk praktiknya pada media apapun"),

        ("social_engineering",
         "Apakah Anda mengetahui cara melindungi diri dari rekayasa sosial?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui secara umum",
         "Saya mengetahui beberapa cara perlindungan",
         "Saya mengetahui secara komprehensif"),

        ("social_engineering",
         "Apakah Anda mengetahui regulasi dan kebijakan terkait keamanan informasi?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui secara umum",
         "Saya mengetahui beberapa regulasi terkait",
         "Saya mengetahui secara mendalam"),

        # === DAMPAK KONTEN NEGATIF (10 questions) ===
        ("negative_content",
         "Apakah Anda mengetahui dampak dari penyebaran konten negatif di platform media sosial?",
         "Saya tidak mengetahui dampak sama sekali",
         "Saya mengetahui dapat menimbulkan dampak, namun hanya secara umum",
         "Saya mengetahui dapat berdampak pada individu dan komunitas",
         "Saya mengetahui dapat berdampak pada individu, komunitas, dan nasional"),

        ("negative_content",
         "Apakah Anda mengetahui dampak hoaks terhadap individu?",
         "Saya tidak mengetahui dampak sama sekali",
         "Saya mengetahui dampak secara umum",
         "Saya mengetahui dampak pada psikologis dan sosial individu",
         "Saya mengetahui dampak psikologis, sosial, dan ekonomi secara mendalam"),

        ("negative_content",
         "Apakah Anda mengetahui dampak hoaks terhadap komunitas/masyarakat?",
         "Saya tidak mengetahui dampak sama sekali",
         "Saya mengetahui dampak secara umum",
         "Saya mengetahui dampak pada polarisasi dan konflik sosial",
         "Saya mengetahui dampak secara komprehensif termasuk disintegrasi sosial"),

        ("negative_content",
         "Apakah Anda mengetahui dampak hoaks terhadap stabilitas nasional?",
         "Saya tidak mengetahui dampak sama sekali",
         "Saya mengetahui dampak secara umum",
         "Saya mengetahui dampak pada politik dan keamanan nasional",
         "Saya mengetahui dampak pada politik, keamanan, dan ekonomi nasional"),

        ("negative_content",
         "Apakah Anda mengetahui jenis-jenis konten negatif di media sosial?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui satu atau dua jenis",
         "Saya mengetahui beberapa jenis konten negatif",
         "Saya mengetahui seluruh jenis konten negatif"),

        ("negative_content",
         "Apakah Anda mengetahui cara mengidentifikasi konten negatif?",
         "Saya tidak mengetahui sama sekali",
         "Saya mengetahui secara umum namun belum terampil",
         "Saya mengetahui dan dapat mengidentifikasi pada beberapa platform",
         "Saya mengetahui dan dapat mengidentifikasi di platform apapun"),

        ("negative_content",
         "Apakah Anda mengetahui regulasi UU ITE terkait konten negatif?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui bahwa UU ITE mengatur konten negatif",
         "Saya mengetahui pasal-pasal utama dalam UU ITE",
         "Saya mengetahui secara mendalam termasuk yurisprudensi"),

        ("negative_content",
         "Apakah Anda mengetahui mekanisme pelaporan konten negatif?",
         "Saya tidak mengetahui sama sekali",
         "Saya mengetahui secara umum namun belum pernah melapor",
         "Saya mengetahui dan pernah menggunakan mekanisme pelaporan",
         "Saya mengetahui semua kanal pelaporan dan aktif menggunakannya"),

        ("negative_content",
         "Apakah Anda mengetahui dampak cyberbullying?",
         "Saya tidak mengetahui dampak sama sekali",
         "Saya mengetahui dampak secara umum",
         "Saya mengetahui dampak pada psikologis korban",
         "Saya mengetahui dampak psikologis, hukum, dan sosial secara komprehensif"),

        ("negative_content",
         "Apakah Anda mengetahui strategi literasi digital untuk menangkal konten negatif?",
         "Saya tidak mengetahui sama sekali",
         "Saya hanya mengetahui definisi literasi digital",
         "Saya mengetahui beberapa strategi literasi digital",
         "Saya mengetahui dan menerapkan strategi literasi digital secara aktif"),
    ]

    for i, (topic, text, s1, s2, s3, s4) in enumerate(questions, start=1):
        cur.execute(
            """INSERT INTO questions (topic, question_text, scale_1, scale_2, scale_3, scale_4, order_num)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (topic, text, s1, s2, s3, s4, i)
        )

    conn.commit()
    conn.close()


def create_respondent(name, email, phone, institution, province, city):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO respondents (name, email, phone, institution, province, city)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (name, email, phone, institution, province, city)
    )
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid


def get_questions():
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM questions ORDER BY order_num"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_response(respondent_id, question_id, score):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO responses (respondent_id, question_id, score) VALUES (?, ?, ?)",
        (respondent_id, question_id, score)
    )
    conn.commit()
    conn.close()


def calculate_assessment(respondent_id):
    conn = get_connection()
    cur = conn.cursor()

    # Get all responses for this respondent
    rows = cur.execute(
        """SELECT r.score, q.topic
           FROM responses r
           JOIN questions q ON r.question_id = q.id
           WHERE r.respondent_id = ?
           ORDER BY q.order_num""",
        (respondent_id,)
    ).fetchall()

    if not rows:
        conn.close()
        return None

    scores = [dict(r) for r in rows]

    # Calculate per-topic
    se_scores = [s["score"] for s in scores if s["topic"] == "social_engineering"]
    nc_scores = [s["score"] for s in scores if s["topic"] == "negative_content"]

    se_total = sum(se_scores)
    nc_total = sum(nc_scores)
    se_max = len(se_scores) * 4
    nc_max = len(nc_scores) * 4

    se_pct = (se_total / se_max * 100) if se_max > 0 else 0
    nc_pct = (nc_total / nc_max * 100) if nc_max > 0 else 0

    se_avg = round(se_total / len(se_scores), 2) if se_scores else 0
    nc_avg = round(nc_total / len(nc_scores), 2) if nc_scores else 0

    # Overall score: weighted average 50% each
    total_score = (se_pct * 0.5) + (nc_pct * 0.5)
    total_score = round(total_score, 2)

    # Grade
    if total_score >= 86:
        grade = "A"
    elif total_score >= 71:
        grade = "B"
    elif total_score >= 56:
        grade = "C"
    else:
        grade = "D"

    # Save assessment
    cur.execute(
        """INSERT OR REPLACE INTO assessments
           (respondent_id, total_score, grade, se_score, nc_score, se_avg, nc_avg)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (respondent_id, total_score, grade, round(se_pct, 2), round(nc_pct, 2), se_avg, nc_avg)
    )
    conn.commit()

    # Get respondent data
    respondent = dict(cur.execute(
        "SELECT * FROM respondents WHERE id = ?", (respondent_id,)
    ).fetchone())

    conn.close()

    return {
        "respondent": respondent,
        "total_score": total_score,
        "grade": grade,
        "se_score": round(se_pct, 2),
        "nc_score": round(nc_pct, 2),
        "se_avg": se_avg,
        "nc_avg": nc_avg,
        "total_questions": len(scores),
        "se_questions": len(se_scores),
        "nc_questions": len(nc_scores),
    }


def get_admin_stats():
    conn = get_connection()
    cur = conn.cursor()

    total = cur.execute("SELECT COUNT(*) FROM respondents").fetchone()[0]
    completed = cur.execute("SELECT COUNT(*) FROM assessments").fetchone()[0]

    grade_dist = cur.execute(
        """SELECT grade, COUNT(*) as count
           FROM assessments GROUP BY grade ORDER BY grade"""
    ).fetchall()

    avg_score = cur.execute(
        "SELECT COALESCE(AVG(total_score), 0) FROM assessments"
    ).fetchone()[0]

    # Grade labels for chart
    grade_labels = {"A": "Sangat Baik", "B": "Baik", "C": "Cukup", "D": "Kurang"}

    # Recent assessments
    recent = cur.execute(
        """SELECT a.*, r.name, r.institution, r.province
           FROM assessments a
           JOIN respondents r ON a.respondent_id = r.id
           ORDER BY a.completed_at DESC
           LIMIT 20"""
    ).fetchall()

    # Geography
    geo = cur.execute(
        """SELECT r.province,
                  COUNT(*) as total,
                  COALESCE(AVG(a.total_score), 0) as avg_score,
                  r.city
           FROM respondents r
           LEFT JOIN assessments a ON r.id = a.respondent_id
           GROUP BY r.province, r.city
           ORDER BY r.province"""
    ).fetchall()

    # Per-question average
    per_question = cur.execute(
        """SELECT q.order_num, q.question_text, q.topic,
                  COALESCE(AVG(r.score), 0) as avg_score,
                  COUNT(r.id) as response_count
           FROM questions q
           LEFT JOIN responses r ON q.id = r.question_id
           GROUP BY q.id
           ORDER BY q.order_num"""
    ).fetchall()

    conn.close()

    return {
        "total_respondents": total,
        "completed_assessments": completed,
        "average_score": round(avg_score, 2),
        "grade_distribution": [
            {"grade": g["grade"], "label": grade_labels.get(g["grade"], g["grade"]), "count": g["count"]}
            for g in grade_dist
        ],
        "recent": [dict(r) for r in recent],
        "geography": [dict(g) for g in geo],
        "per_question": [dict(q) for q in per_question],
    }
