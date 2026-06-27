"""
Survey Chatbot — Full Web App
FastAPI backend with Jinja2 templates.
"""
import os
import uuid
from pathlib import Path
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from database import (
    init_db, seed_questions, create_respondent,
    get_questions, save_response, calculate_assessment, get_admin_stats
)

app = FastAPI(title="Survey Chatbot — Kesadaran Digital")

# Mount static files
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "css").mkdir(exist_ok=True)
(static_dir / "js").mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Templates
templates = Path(__file__).parent / "templates"
templates.mkdir(exist_ok=True)
tpl = Jinja2Templates(directory=str(templates))

# In-memory session store (survey progress)
survey_sessions = {}


# ─── Startup ──────────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()
    seed_questions()


# ─── Routes ───────────────────────────────────────────────────────

@app.get("/")
def index(request: Request):
    return tpl.TemplateResponse("index.html", {"request": request})


@app.post("/api/survey/start")
def start_survey(
    name: str = Form(...),
    email: str = Form(""),
    phone: str = Form(""),
    institution: str = Form(""),
    province: str = Form(""),
    city: str = Form(""),
):
    if not name.strip():
        raise HTTPException(400, "Nama wajib diisi")

    rid = create_respondent(name.strip(), email, phone, institution, province, city)
    questions = get_questions()

    session_id = str(uuid.uuid4())
    survey_sessions[session_id] = {
        "respondent_id": rid,
        "current_q": 0,
        "total_q": len(questions),
        "done": False,
    }

    return {
        "session_id": session_id,
        "respondent_id": rid,
        "total_questions": len(questions),
    }


@app.get("/api/survey/questions")
def get_survey_questions():
    questions = get_questions()
    return {"questions": questions}


@app.get("/api/survey/{session_id}/current")
def current_question(session_id: str):
    sess = survey_sessions.get(session_id)
    if not sess:
        raise HTTPException(404, "Session tidak ditemukan")
    if sess["done"]:
        return {"done": True, "respondent_id": sess["respondent_id"]}

    questions = get_questions()
    idx = sess["current_q"]
    if idx >= len(questions):
        sess["done"] = True
        return {"done": True, "respondent_id": sess["respondent_id"]}

    q = questions[idx]
    return {
        "done": False,
        "index": idx,
        "total": len(questions),
        "question": {
            "id": q["id"],
            "order_num": q["order_num"],
            "topic": q["topic"],
            "question_text": q["question_text"],
            "scale_1": q["scale_1"],
            "scale_2": q["scale_2"],
            "scale_3": q["scale_3"],
            "scale_4": q["scale_4"],
        },
        "progress": round((idx / len(questions)) * 100),
    }


@app.post("/api/survey/{session_id}/answer")
def answer_question(session_id: str, question_id: int = Form(...), score: int = Form(...)):
    sess = survey_sessions.get(session_id)
    if not sess:
        raise HTTPException(404, "Session tidak ditemukan")
    if sess["done"]:
        raise HTTPException(400, "Survey sudah selesai")

    if score < 1 or score > 4:
        raise HTTPException(400, "Skor harus antara 1–4")

    save_response(sess["respondent_id"], question_id, score)
    sess["current_q"] += 1

    questions = get_questions()
    if sess["current_q"] >= len(questions):
        sess["done"] = True
        # Calculate assessment
        result = calculate_assessment(sess["respondent_id"])
        return {"done": True, "result": result}

    return {"done": False, "next_index": sess["current_q"], "total": len(questions)}


@app.get("/api/survey/{session_id}/result")
def get_result(session_id: str):
    sess = survey_sessions.get(session_id)
    if not sess:
        raise HTTPException(404, "Session tidak ditemukan")

    result = calculate_assessment(sess["respondent_id"])
    if not result:
        raise HTTPException(400, "Belum ada hasil assessment")

    return result


# ─── Admin Routes ────────────────────────────────────────────────

@app.get("/admin")
def admin_dashboard(request: Request):
    return tpl.TemplateResponse("admin.html", {"request": request})


@app.get("/api/admin/stats")
def admin_stats():
    return get_admin_stats()


@app.get("/survey")
def survey_page(request: Request):
    return tpl.TemplateResponse("survey.html", {"request": request})


@app.get("/result/{session_id}")
def result_page(request: Request, session_id: str):
    sess = survey_sessions.get(session_id)
    if not sess:
        return RedirectResponse(url="/")
    return tpl.TemplateResponse("result.html", {
        "request": request,
        "session_id": session_id,
        "respondent_id": sess["respondent_id"],
    })
