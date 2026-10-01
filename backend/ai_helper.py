import os
import requests

URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Tried in order; set GEMINI_MODEL in your environment to put a model first.
MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"]

SYSTEM = ("You are a friendly AI assistant inside a Financial Calculator web app for students in India. "
          "Answer any question clearly and briefly (under 150 words unless asked for more). "
          "For money topics, explain simply for beginners and use rupee examples. "
          "Reply in {language}.")

MSG = {
  "busy": {"en": "The AI is busy right now (free limit reached). Please try again in a minute.",
           "te": "AI ప్రస్తుతం బిజీగా ఉంది. ఒక నిమిషం తర్వాత మళ్ళీ ప్రయత్నించండి."},
  "key": {"en": "The AI key isn't working. The site owner needs to check GEMINI_API_KEY.",
          "te": "AI కీ పని చేయడం లేదు. సైట్ యజమాని GEMINI_API_KEY ని తనిఖీ చేయాలి."},
  "nokey": {"en": "\n\n(AI mode is off. The site owner can turn it on by adding GEMINI_API_KEY.)",
            "te": "\n\n(AI మోడ్ ఆఫ్‌లో ఉంది. GEMINI_API_KEY జోడిస్తే ఆన్ అవుతుంది.)"},
}

KB = [
  (("emi", "loan", "interest"), {
    "en": "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where r is the monthly rate and n the number of months. A shorter tenure lowers total interest but raises the EMI.",
    "te": "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1). r నెలవారీ వడ్డీ రేటు, n నెలల సంఖ్య. తక్కువ కాలపరిమితి వల్ల వడ్డీ తగ్గుతుంది కానీ EMI పెరుగుతుంది."}),
  (("gst", "tax"), {
    "en": "GST exclusive: total = price + price × rate ÷ 100. GST inclusive: base = price ÷ (1 + rate ÷ 100). Common rates: 5, 12, 18, 28%.",
    "te": "GST ఎక్స్‌క్లూజివ్: మొత్తం = ధర + ధర × రేటు ÷ 100. ఇన్‌క్లూజివ్: అసలు ధర = ధర ÷ (1 + రేటు ÷ 100)."}),
  (("saving", "save", "goal", "income"), {
    "en": "Savings = income − expenses. Months to reach a goal = goal price ÷ monthly savings. Try the 50/30/20 rule: needs, wants, savings.",
    "te": "పొదుపు = ఆదాయం − ఖర్చులు. లక్ష్యానికి నెలలు = లక్ష్య ధర ÷ నెలవారీ పొదుపు."}),
  (("percent", "%", "discount"), {
    "en": "Percentage of a total = total × percent ÷ 100. For a discount, subtract that value from the price.",
    "te": "మొత్తంలో శాతం = మొత్తం × శాతం ÷ 100. డిస్కౌంట్ అయితే ఆ విలువను ధర నుండి తీసివేయండి."}),
]
FALLBACK = {
  "en": "I can help with savings, EMI, GST and percentages. Try asking 'How is EMI calculated?'",
  "te": "నేను పొదుపు, EMI, GST, శాతాల గురించి సహాయం చేయగలను. 'EMI ఎలా లెక్కిస్తారు?' అని అడగండి."}


def offline(q, lang):
    """Returns (text, matched_a_topic)."""
    ql = q.lower()
    for keys, ans in KB:
        if any(k in ql for k in keys):
            return ans[lang], True
    return FALLBACK[lang], False


def ask_gemini(q, lang, key):
    """Returns (text, error_code). error_code is None on success."""
    models = [m for m in [os.getenv("GEMINI_MODEL")] + MODELS if m]
    body = {"systemInstruction": {"parts": [{"text": SYSTEM.format(language="Telugu" if lang == "te" else "English")}]},
            "contents": [{"role": "user", "parts": [{"text": q}]}]}
    err = "network"
    for model in models:
        try:
            r = requests.post(URL.format(model=model), json=body, timeout=20,
                              headers={"x-goog-api-key": key, "Content-Type": "application/json"})
        except requests.RequestException:
            err = "network"
            continue
        if r.status_code == 200:
            try:
                return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip(), None
            except (KeyError, IndexError, ValueError):
                return None, "empty"
        err = r.status_code
        if r.status_code != 404:      # 404 = model name not available, try the next one
            break
    return None, err


def answer(q, lang="en"):
    lang = "te" if lang == "te" else "en"
    q = q.strip()[:1000]
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        text, matched = offline(q, lang)
        return text if matched else text + MSG["nokey"][lang]
    text, err = ask_gemini(q, lang, key)
    if text:
        return text
    if err == 429:
        return MSG["busy"][lang]
    if err in (400, 401, 403):
        return MSG["key"][lang]
    return offline(q, lang)[0]
