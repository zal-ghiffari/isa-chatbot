import sqlite3, os, hashlib, uuid

DB_PATH = os.environ.get("DB_PATH") or os.path.join(os.path.dirname(os.path.dirname(__file__)), "survey.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def hash_password(password):
    salt = "isa_chatbot_salt_2024"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );
        CREATE TABLE IF NOT EXISTS survey_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            creator_id INTEGER NOT NULL REFERENCES users(id),
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );
        CREATE TABLE IF NOT EXISTS auth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            token TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );
        CREATE TABLE IF NOT EXISTS respondents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            institution TEXT,
            province TEXT DEFAULT '',
            city TEXT DEFAULT '',
            user_id INTEGER REFERENCES users(id),
            session_id INTEGER REFERENCES survey_sessions(id),
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
    # Migrate existing tables: add columns if missing
    for col in ['user_id', 'session_id']:
        try:
            cur.execute(f"ALTER TABLE respondents ADD COLUMN {col} INTEGER")
        except sqlite3.OperationalError:
            pass
    conn.commit(), conn.close()

def seed_questions():
    conn = get_connection()
    cur = conn.cursor()
    if cur.execute("SELECT COUNT(*) FROM questions").fetchone()[0] > 0:
        conn.close()
        return
    questions = [
        ("social_engineering","Apakah Anda mengetahui apa yang dimaksud dengan rekayasa sosial (social engineering)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui definisi dan beberapa bentuk praktiknya","Saya mengetahui definisi dan seluruh bentuk praktiknya"),
        ("social_engineering","Apakah Anda mengetahui bentuk-bentuk praktik rekayasa sosial?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik phishing dalam rekayasa sosial?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik pretexting (pemalsuan identitas)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik baiting (iming-iming)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik quid pro quo (timbal balik)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik tailgating (ikut masuk area terbatas)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui teknik spear phishing (phishing tertarget)?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisinya namun tidak mengetahui bentuk praktiknya","Saya mengetahui bentuk praktiknya hanya pada beberapa media","Saya mengetahui bentuk praktiknya pada media apapun"),
        ("social_engineering","Apakah Anda mengetahui cara melindungi diri dari rekayasa sosial?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui secara umum","Saya mengetahui beberapa cara perlindungan","Saya mengetahui secara komprehensif"),
        ("social_engineering","Apakah Anda mengetahui regulasi dan kebijakan terkait keamanan informasi?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui secara umum","Saya mengetahui beberapa regulasi terkait","Saya mengetahui secara mendalam"),
        ("negative_content","Apakah Anda mengetahui dampak dari penyebaran konten negatif di platform media sosial?","Saya tidak mengetahui dampak sama sekali","Saya mengetahui dapat menimbulkan dampak, namun hanya secara umum","Saya mengetahui dapat berdampak pada individu dan komunitas","Saya mengetahui dapat berdampak pada individu, komunitas, dan nasional"),
        ("negative_content","Apakah Anda mengetahui dampak hoaks terhadap individu?","Saya tidak mengetahui dampak sama sekali","Saya mengetahui dampak secara umum","Saya mengetahui dampak pada psikologis dan sosial individu","Saya mengetahui dampak psikologis, sosial, dan ekonomi secara mendalam"),
        ("negative_content","Apakah Anda mengetahui dampak hoaks terhadap komunitas/masyarakat?","Saya tidak mengetahui dampak sama sekali","Saya mengetahui dampak secara umum","Saya mengetahui dampak pada polarisasi dan konflik sosial","Saya mengetahui dampak secara komprehensif termasuk disintegrasi sosial"),
        ("negative_content","Apakah Anda mengetahui dampak hoaks terhadap stabilitas nasional?","Saya tidak mengetahui dampak sama sekali","Saya mengetahui dampak secara umum","Saya mengetahui dampak pada politik dan keamanan nasional","Saya mengetahui dampak pada politik, keamanan, dan ekonomi nasional"),
        ("negative_content","Apakah Anda mengetahui jenis-jenis konten negatif di media sosial?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui satu atau dua jenis","Saya mengetahui beberapa jenis konten negatif","Saya mengetahui seluruh jenis konten negatif"),
        ("negative_content","Apakah Anda mengetahui cara mengidentifikasi konten negatif?","Saya tidak mengetahui sama sekali","Saya mengetahui secara umum namun belum terampil","Saya mengetahui dan dapat mengidentifikasi pada beberapa platform","Saya mengetahui dan dapat mengidentifikasi di platform apapun"),
        ("negative_content","Apakah Anda mengetahui regulasi UU ITE terkait konten negatif?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui bahwa UU ITE mengatur konten negatif","Saya mengetahui pasal-pasal utama dalam UU ITE","Saya mengetahui secara mendalam termasuk yurisprudensi"),
        ("negative_content","Apakah Anda mengetahui mekanisme pelaporan konten negatif?","Saya tidak mengetahui sama sekali","Saya mengetahui secara umum namun belum pernah melapor","Saya mengetahui dan pernah menggunakan mekanisme pelaporan","Saya mengetahui semua kanal pelaporan dan aktif menggunakannya"),
        ("negative_content","Apakah Anda mengetahui dampak cyberbullying?","Saya tidak mengetahui dampak sama sekali","Saya mengetahui dampak secara umum","Saya mengetahui dampak pada psikologis korban","Saya mengetahui dampak psikologis, hukum, dan sosial secara komprehensif"),
        ("negative_content","Apakah Anda mengetahui strategi literasi digital untuk menangkal konten negatif?","Saya tidak mengetahui sama sekali","Saya hanya mengetahui definisi literasi digital","Saya mengetahui beberapa strategi literasi digital","Saya mengetahui dan menerapkan strategi literasi digital secara aktif"),
    ]
    for i, (topic, text, s1, s2, s3, s4) in enumerate(questions, start=1):
        cur.execute("INSERT INTO questions (topic, question_text, scale_1, scale_2, scale_3, scale_4, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)", (topic, text, s1, s2, s3, s4, i))
    conn.commit(), conn.close()

# ─── Auth ────────────────────────────────────────────────────────────

def register_user(name, email, password):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", (name, email, hash_password(password)))
        conn.commit()
        uid = cur.lastrowid
        token = str(uuid.uuid4())
        cur.execute("INSERT INTO auth_tokens (user_id, token) VALUES (?, ?)", (uid, token))
        conn.commit()
        user = dict(cur.execute("SELECT id, name, email, role FROM users WHERE id = ?", (uid,)).fetchone())
        conn.close()
        return {**user, "token": token}
    except sqlite3.IntegrityError:
        conn.close()
        return None

def login_user(email, password):
    conn = get_connection()
    cur = conn.cursor()
    user = cur.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or user["password_hash"] != hash_password(password):
        conn.close()
        return None
    user = dict(user)
    token = str(uuid.uuid4())
    cur.execute("INSERT INTO auth_tokens (user_id, token) VALUES (?, ?)", (user["id"], token))
    conn.commit()
    conn.close()
    return {**user, "token": token}

def get_user_by_token(token):
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT u.id, u.name, u.email, u.role FROM auth_tokens t JOIN users u ON t.user_id = u.id WHERE t.token = ?", (token,)).fetchone()
    conn.close()
    return dict(row) if row else None

def logout_user(token):
    conn = get_connection()
    conn.execute("DELETE FROM auth_tokens WHERE token = ?", (token,))
    conn.commit(), conn.close()

def get_all_users():
    conn = get_connection()
    rows = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ─── Survey Sessions ─────────────────────────────────────────────────

def create_session(creator_id, title, description):
    conn = get_connection()
    cur = conn.cursor()
    token = str(uuid.uuid4())[:8].upper()
    cur.execute("INSERT INTO survey_sessions (token, title, description, creator_id) VALUES (?, ?, ?, ?)", (token, title, description, creator_id))
    conn.commit()
    sid = cur.lastrowid
    s = dict(cur.execute("SELECT * FROM survey_sessions WHERE id = ?", (sid,)).fetchone())
    conn.close()
    return s

def get_user_sessions(user_id):
    conn = get_connection()
    rows = conn.execute("""
        SELECT s.*, (SELECT COUNT(*) FROM respondents WHERE session_id = s.id) as participant_count
        FROM survey_sessions s WHERE s.creator_id = ? ORDER BY s.created_at DESC
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_session_by_token(token):
    conn = get_connection()
    s = conn.execute("SELECT * FROM survey_sessions WHERE token = ?", (token,)).fetchone()
    conn.close()
    return dict(s) if s else None

def get_session_by_id(session_id):
    conn = get_connection()
    s = conn.execute("SELECT * FROM survey_sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    return dict(s) if s else None

def get_session_results(session_id):
    conn = get_connection()
    cur = conn.cursor()
    participants = cur.execute("""
        SELECT r.id, r.name, r.institution, a.total_score, a.grade, a.completed_at
        FROM respondents r LEFT JOIN assessments a ON r.id = a.respondent_id
        WHERE r.session_id = ? ORDER BY a.completed_at DESC
    """, (session_id,)).fetchall()
    total = len(participants)
    completed = sum(1 for p in participants if p["total_score"] is not None)
    scores = [p["total_score"] for p in participants if p["total_score"] is not None]
    avg_score = round(sum(scores) / len(scores), 2) if scores else 0
    grade_dist = {}
    for p in participants:
        if p["grade"]:
            grade_dist[p["grade"]] = grade_dist.get(p["grade"], 0) + 1
    conn.close()
    return {
        "total_participants": total,
        "completed": completed,
        "average_score": avg_score,
        "grade_distribution": [{"grade": g, "count": c} for g, c in grade_dist.items()],
        "participants": [dict(p) for p in participants],
    }

def get_all_sessions():
    conn = get_connection()
    rows = conn.execute("""
        SELECT s.*, u.name as creator_name,
               (SELECT COUNT(*) FROM respondents WHERE session_id = s.id) as participant_count
        FROM survey_sessions s JOIN users u ON s.creator_id = u.id
        ORDER BY s.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ─── Survey ──────────────────────────────────────────────────────────

def create_respondent(name, email, phone, institution, province, city, user_id=None, session_id=None):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO respondents (name, email, phone, institution, province, city, user_id, session_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (name, email, phone, institution, province, city, user_id, session_id))
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid

def get_questions():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM questions ORDER BY order_num").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_response(respondent_id, question_id, score):
    conn = get_connection()
    conn.execute("INSERT INTO responses (respondent_id, question_id, score) VALUES (?, ?, ?)", (respondent_id, question_id, score))
    conn.commit(), conn.close()

def calculate_assessment(respondent_id):
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute("SELECT r.score, q.topic FROM responses r JOIN questions q ON r.question_id = q.id WHERE r.respondent_id = ? ORDER BY q.order_num", (respondent_id,)).fetchall()
    if not rows:
        conn.close(); return None
    scores = [dict(r) for r in rows]
    se_scores = [s["score"] for s in scores if s["topic"] == "social_engineering"]
    nc_scores = [s["score"] for s in scores if s["topic"] == "negative_content"]
    se_total, nc_total = sum(se_scores), sum(nc_scores)
    se_max, nc_max = len(se_scores) * 4, len(nc_scores) * 4
    se_pct = (se_total / se_max * 100) if se_max > 0 else 0
    nc_pct = (nc_total / nc_max * 100) if nc_max > 0 else 0
    se_avg = round(se_total / len(se_scores), 2) if se_scores else 0
    nc_avg = round(nc_total / len(nc_scores), 2) if nc_scores else 0
    total_score = round((se_pct * 0.5) + (nc_pct * 0.5), 2)
    grade = "A" if total_score >= 86 else "B" if total_score >= 71 else "C" if total_score >= 56 else "D"
    cur.execute("INSERT OR REPLACE INTO assessments (respondent_id, total_score, grade, se_score, nc_score, se_avg, nc_avg) VALUES (?, ?, ?, ?, ?, ?, ?)", (respondent_id, total_score, grade, round(se_pct, 2), round(nc_pct, 2), se_avg, nc_avg))
    conn.commit()
    respondent = dict(cur.execute("SELECT * FROM respondents WHERE id = ?", (respondent_id,)).fetchone())
    conn.close()
    return {"respondent": respondent, "total_score": total_score, "grade": grade, "se_score": round(se_pct, 2), "nc_score": round(nc_pct, 2), "se_avg": se_avg, "nc_avg": nc_avg, "total_questions": len(scores), "se_questions": len(se_scores), "nc_questions": len(nc_scores)}

def get_respondent_detail(respondent_id):
    conn = get_connection()
    cur = conn.cursor()
    respondent = cur.execute("SELECT * FROM respondents WHERE id = ?", (respondent_id,)).fetchone()
    if not respondent:
        conn.close(); return None
    respondent = dict(respondent)
    assessment = cur.execute("SELECT * FROM assessments WHERE respondent_id = ?", (respondent_id,)).fetchone()
    answers = cur.execute("SELECT r.score, q.order_num, q.topic, q.question_text, q.scale_1, q.scale_2, q.scale_3, q.scale_4 FROM responses r JOIN questions q ON r.question_id = q.id WHERE r.respondent_id = ? ORDER BY q.order_num", (respondent_id,)).fetchall()
    conn.close()
    return {"respondent": respondent, "assessment": dict(assessment) if assessment else None, "answers": [dict(a) for a in answers]}

def get_admin_stats():
    conn = get_connection()
    cur = conn.cursor()
    total = cur.execute("SELECT COUNT(*) FROM respondents").fetchone()[0]
    completed = cur.execute("SELECT COUNT(*) FROM assessments").fetchone()[0]
    grade_dist = cur.execute("SELECT grade, COUNT(*) as count FROM assessments GROUP BY grade ORDER BY grade").fetchall()
    avg_score = cur.execute("SELECT COALESCE(AVG(total_score), 0) FROM assessments").fetchone()[0]
    grade_labels = {"A": "Sangat Baik", "B": "Baik", "C": "Cukup", "D": "Kurang"}
    recent = cur.execute("SELECT a.*, r.name, r.institution, r.province FROM assessments a JOIN respondents r ON a.respondent_id = r.id ORDER BY a.completed_at DESC LIMIT 20").fetchall()
    geo = cur.execute("SELECT r.province, COUNT(*) as total, COALESCE(AVG(a.total_score), 0) as avg_score, r.city FROM respondents r LEFT JOIN assessments a ON r.id = a.respondent_id GROUP BY r.province, r.city ORDER BY r.province").fetchall()
    per_question = cur.execute("SELECT q.order_num, q.question_text, q.topic, COALESCE(AVG(r.score), 0) as avg_score, COUNT(r.id) as response_count FROM questions q LEFT JOIN responses r ON q.id = r.question_id GROUP BY q.id ORDER BY q.order_num").fetchall()
    total_users = cur.execute("SELECT COUNT(*) FROM users WHERE role='user'").fetchone()[0]
    total_sessions = cur.execute("SELECT COUNT(*) FROM survey_sessions").fetchone()[0]
    conn.close()
    return {"total_respondents": total, "completed_assessments": completed, "average_score": round(avg_score, 2), "grade_distribution": [{"grade": g["grade"], "label": grade_labels.get(g["grade"], g["grade"]), "count": g["count"]} for g in grade_dist], "recent": [dict(r) for r in recent], "geography": [dict(g) for g in geo], "per_question": [dict(q) for q in per_question], "total_users": total_users, "total_sessions": total_sessions}

def get_respondents_by_user(user_id):
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT r.id as respondent_id, r.name, r.email, r.institution, a.total_score, a.grade, a.completed_at, s.title as session_title
        FROM respondents r LEFT JOIN assessments a ON r.id = a.respondent_id
        LEFT JOIN survey_sessions s ON r.session_id = s.id
        WHERE r.user_id = ? ORDER BY a.completed_at DESC
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def seed_admin():
    conn = get_connection()
    cur = conn.cursor()
    admin = cur.execute("SELECT id FROM users WHERE role='admin' LIMIT 1").fetchone()
    if not admin:
        cur.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("Admin", "admin@admin.com", hash_password("admin123"), "admin"))
        conn.commit()
        print("Default admin created: admin@admin.com / admin123")
    else:
        cur.execute("UPDATE users SET email=?, password_hash=? WHERE id=?",
            ("admin@admin.com", hash_password("admin123"), admin["id"]))
        conn.commit()
        print("Admin credentials updated: admin@admin.com / admin123")
    conn.close()
