import os, uuid
from fastapi import FastAPI, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from .database import (
    init_db, seed_questions, seed_admin, create_respondent, get_questions,
    save_response, calculate_assessment, get_admin_stats, get_respondent_detail,
    register_user, login_user, get_user_by_token, logout_user,
    get_all_users, create_session, get_user_sessions,
    get_session_by_token, get_session_by_id, get_session_results,
    get_all_sessions, get_respondents_by_user,
)

app = FastAPI(title="Survey Chatbot — Kesadaran Digital")

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

survey_sessions = {}

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return None
    return get_user_by_token(authorization)

def require_auth(authorization: str = Header(None)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    return user

def require_admin(authorization: str = Header(None)):
    user = require_auth(authorization)
    if user["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    return user

@app.on_event("startup")
def startup():
    init_db()
    seed_questions()
    seed_admin()

@app.get("/api/health")
def health():
    return {"status": "ok"}

# ─── Auth ────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
def register(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    result = register_user(name, email, password)
    if not result:
        raise HTTPException(409, "Email sudah terdaftar")
    return result

@app.post("/api/auth/login")
def login(email: str = Form(...), password: str = Form(...)):
    result = login_user(email, password)
    if not result:
        raise HTTPException(401, "Email atau password salah")
    return result

@app.get("/api/auth/me")
def me(authorization: str = Header(None)):
    return require_auth(authorization)

@app.post("/api/auth/logout")
def logout(authorization: str = Header(None)):
    require_auth(authorization)
    logout_user(authorization)
    return {"ok": True}

# ─── Survey Sessions (Creator) ──────────────────────────────────────

@app.post("/api/sessions/create")
def create_session_api(title: str = Form(...), description: str = Form(""), authorization: str = Header(None)):
    user = require_auth(authorization)
    s = create_session(user["id"], title, description)
    return s

@app.get("/api/sessions/my")
def my_sessions(authorization: str = Header(None)):
    user = require_auth(authorization)
    return get_user_sessions(user["id"])

@app.get("/api/sessions/info/{token}")
def get_session_info(token: str):
    s = get_session_by_token(token)
    if not s:
        raise HTTPException(404, "Session tidak ditemukan")
    return s

@app.get("/api/sessions/{token}/results")
def session_results(token: str, authorization: str = Header(None)):
    user = require_auth(authorization)
    s = get_session_by_token(token)
    if not s:
        raise HTTPException(404, "Session tidak ditemukan")
    if s["creator_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    return get_session_results(s["id"])

# ─── Survey ──────────────────────────────────────────────────────────

@app.post("/api/survey/start")
def start_survey(
    name: str = Form(...), email: str = Form(""), phone: str = Form(""),
    institution: str = Form(""), province: str = Form(""), city: str = Form(""),
    session_token: str = Form(""), authorization: str = Form(""),
    avatar: str = Form(""),
):
    if not name.strip():
        raise HTTPException(400, "Nama wajib diisi")
    user_id = None
    session_db_id = None
    if authorization:
        user = get_user_by_token(authorization)
        if user:
            user_id = user["id"]
    if session_token:
        s = get_session_by_token(session_token)
        if s:
            session_db_id = s["id"]
    rid = create_respondent(name.strip(), email, phone, institution, province, city, user_id, session_db_id, avatar)
    questions = get_questions()
    sess_id = str(uuid.uuid4())
    survey_sessions[sess_id] = {"respondent_id": rid, "current_q": 0, "total_q": len(questions), "done": False}
    return {"session_id": sess_id, "respondent_id": rid, "total_questions": len(questions)}

@app.get("/api/survey/questions")
def get_survey_questions():
    return {"questions": get_questions()}

@app.get("/api/survey/{session_id}/current")
def current_question(session_id: str):
    sess = survey_sessions.get(session_id)
    if not sess: raise HTTPException(404, "Session tidak ditemukan")
    if sess["done"]: return {"done": True, "respondent_id": sess["respondent_id"]}
    questions = get_questions()
    idx = sess["current_q"]
    if idx >= len(questions):
        sess["done"] = True
        return {"done": True, "respondent_id": sess["respondent_id"]}
    q = questions[idx]
    return {"done": False, "index": idx, "total": len(questions),
        "question": {"id": q["id"], "order_num": q["order_num"], "topic": q["topic"],
            "question_text": q["question_text"], "scale_1": q["scale_1"],
            "scale_2": q["scale_2"], "scale_3": q["scale_3"], "scale_4": q["scale_4"]},
        "progress": round((idx / len(questions)) * 100)}

@app.post("/api/survey/{session_id}/answer")
def answer_question(session_id: str, question_id: int = Form(...), score: int = Form(...)):
    sess = survey_sessions.get(session_id)
    if not sess: raise HTTPException(404, "Session tidak ditemukan")
    if sess["done"]: raise HTTPException(400, "Survey sudah selesai")
    if score < 1 or score > 4: raise HTTPException(400, "Skor harus antara 1-4")
    save_response(sess["respondent_id"], question_id, score)
    sess["current_q"] += 1
    questions = get_questions()
    if sess["current_q"] >= len(questions):
        sess["done"] = True
        return {"done": True, "result": calculate_assessment(sess["respondent_id"])}
    return {"done": False, "next_index": sess["current_q"], "total": len(questions)}

@app.get("/api/survey/{session_id}/result")
def get_result(session_id: str):
    sess = survey_sessions.get(session_id)
    if not sess: raise HTTPException(404, "Session tidak ditemukan")
    result = calculate_assessment(sess["respondent_id"])
    if not result: raise HTTPException(400, "Belum ada hasil assessment")
    session_info = None
    if result["respondent"].get("session_id"):
        s = get_session_by_id(result["respondent"]["session_id"])
        if s:
            session_info = {"title": s["title"], "token": s["token"]}
    result["session"] = session_info
    return result

# ─── User Dashboard ──────────────────────────────────────────────────

@app.get("/api/user/surveys")
def user_surveys(authorization: str = Header(None)):
    user = require_auth(authorization)
    return get_respondents_by_user(user["id"])

# ─── Admin ───────────────────────────────────────────────────────────

@app.get("/api/admin/stats")
def admin_stats():
    return get_admin_stats()

@app.get("/api/admin/respondent/{respondent_id}")
def respondent_detail(respondent_id: int):
    result = get_respondent_detail(respondent_id)
    if not result: raise HTTPException(404, "Responden tidak ditemukan")
    return result

@app.get("/api/admin/users")
def admin_users(authorization: str = Header(None)):
    require_admin(authorization)
    return get_all_users()

@app.get("/api/admin/sessions")
def admin_sessions(authorization: str = Header(None)):
    require_admin(authorization)
    return get_all_sessions()
