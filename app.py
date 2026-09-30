import os
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from backend import calculations as calc
from backend.learn_data import LEARN
from backend.ai_helper import answer

load_dotenv()
BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder=os.path.join(BASE, "templates"),
            static_folder=os.path.join(BASE, "static"))


def run(fn):
    try:
        return jsonify(fn(request.get_json(force=True, silent=True) or {}))
    except (ValueError, TypeError, ZeroDivisionError) as e:
        return jsonify(error=str(e)), 400


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/api/savings")
def savings(): return run(calc.savings)


@app.post("/api/emi")
def emi(): return run(calc.emi)


@app.post("/api/gst")
def gst(): return run(calc.gst)


@app.post("/api/percentage")
def percentage(): return run(calc.percentage)


@app.get("/api/learn")
def learn(): return jsonify(LEARN)


@app.post("/api/ask-ai")
def ask_ai():
    d = request.get_json(force=True, silent=True) or {}
    q = (d.get("question") or "").strip()
    if not q:
        return jsonify(error="Please type a question."), 400
    return jsonify(answer=answer(q, d.get("lang", "en")))


if __name__ == "__main__":
    app.run(debug=True)
