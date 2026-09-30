def _n(d, key, required=True):
    v = d.get(key)
    if v in (None, ""):
        if required:
            raise ValueError(f"{key} is required")
        return None
    try:
        v = float(v)
    except (TypeError, ValueError):
        raise ValueError(f"{key} must be a number")
    if v < 0:
        raise ValueError(f"{key} cannot be negative")
    return v


def split_months(months):
    days = round(months * 30)
    return days // 365, (days % 365) // 30, (days % 365) % 30


def savings(d):
    income, expenses, price = _n(d, "income"), _n(d, "expenses"), _n(d, "goal_price")
    available = income - expenses
    if available <= 0:
        raise ValueError("Expenses must be lower than income to save anything")
    months = price / available
    y, m, dd = split_months(months)
    res = {"goal_name": d.get("goal_name") or "Your goal", "available": available,
           "months": months, "years": y, "months_part": m, "days": dd,
           "savings_rate": available / income * 100 if income else 0,
           "income": income, "expenses": expenses, "goal_price": price}
    period = _n(d, "target_period", required=False)
    if period:
        target = period * 12 if d.get("target_unit") == "years" else period
        ratio = months / target
        res.update(target_months=target, needed_per_month=price / target,
                   comparison="sufficient" if ratio <= 1 else "close" if ratio <= 1.25 else "insufficient")
    return res


def emi(d):
    p, rate, tenure = _n(d, "principal"), _n(d, "rate"), _n(d, "tenure")
    if p <= 0 or tenure <= 0:
        raise ValueError("Principal and tenure must be greater than zero")
    n = max(1, int(round(tenure * 12 if d.get("tenure_unit", "years") == "years" else tenure)))
    paid = min(int(_n(d, "paid", required=False) or 0), n)
    r = rate / 12 / 100
    e = p / n if r == 0 else p * r * (1 + r) ** n / ((1 + r) ** n - 1)
    bal, sched = p, []
    for _ in range(n):
        bal = bal * (1 + r) - e
        sched.append(max(bal, 0))
    total = e * n
    return {"emi": e, "total_payable": total, "total_interest": total - p, "principal": p,
            "months": n, "paid": paid, "remaining_balance": p if paid == 0 else sched[paid - 1],
            "schedule": sched}


def gst(d):
    price, rate = _n(d, "price"), _n(d, "gst_rate")
    if d.get("mode") == "inclusive":
        base = price / (1 + rate / 100)
        tax, total = price - base, price
    else:
        base, tax = price, price * rate / 100
        total = base + tax
    return {"product": d.get("product") or "Product", "base": base, "gst": tax,
            "total": total, "rate": rate, "mode": d.get("mode", "exclusive")}


def percentage(d):
    total, pct = _n(d, "total"), _n(d, "percentage")
    val = total * pct / 100
    return {"total": total, "percentage": pct, "value": val, "remaining": total - val}
