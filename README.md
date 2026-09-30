# Financial Calculator PRO
Flask + Chart.js mini project (Deep Teal & Coral theme): Savings, EMI, GST, Percentage, bilingual Learn, Ask Questions.

## Run locally
    python -m venv venv && venv\Scripts\activate   (Windows)
    pip install -r requirements.txt
    python app.py            # http://127.0.0.1:5000
    python -m unittest discover -s tests

## Chart.js
Loaded from the jsDelivr CDN in `templates/index.html` (no download needed).

## Optional Gemini
Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Without it, an offline knowledge base answers.

## Deploy
Push to GitHub → Import in Vercel (vercel.json + api/index.py are ready). Add GEMINI_API_KEY in Vercel env vars if wanted.
