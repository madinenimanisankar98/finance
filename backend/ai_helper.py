import os
import requests

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
    lang = "te" if lang == "te" else "en"
    ql = q.lower()
    for keys, ans in KB:
        if any(k in ql for k in keys):
            return ans[lang]
    return FALLBACK[lang]


def answer(q, lang="en"):
    key = os.getenv("GEMINI_API_KEY")
    if key:
        try:
            url = ("https://generativelanguage.googleapis.com/v1beta/models/"
                   f"gemini-2.0-flash:generateContent?key={key}")
            prompt = ("You are a friendly finance tutor for beginners in India. "
                      f"Answer briefly in {'Telugu' if lang == 'te' else 'English'}.\nQuestion: {q}")
            r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15)
            r.raise_for_status()
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass
    return offline(q, lang)
