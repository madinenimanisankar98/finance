let lang = 'en';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '₹' + Number(n).toLocaleString('en-IN', {maximumFractionDigits: 2});
const stat = (k, v) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`;

function show(id) {
  $$('main > section').forEach(s => s.hidden = s.id !== id);
  window.scrollTo({top: 0, behavior: 'smooth'});
}
$$('[data-open]').forEach(b => b.onclick = () => {
  const r = b.getBoundingClientRect();            // measure before the card is hidden
  show(b.dataset.open);
  Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 3000);
  showQuote(b.dataset.open);
});
$$('.back').forEach(b => b.onclick = () => show('home'));

const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const hero = (label, value) => `<div class="hero"><span>${label}</span><b>${value}</b></div>`;

// Turn a month count into text.
// With a target period: 12+ months -> years and months, under 12 -> months (days only if under a month).
// Without a target period: always months and days, never years.
function duration(totalMonths, hasTarget) {
  let m = Math.floor(totalMonths), d = Math.round((totalMonths - m) * 30);
  if (d >= 30) { m += 1; d = 0; }
  if (hasTarget && m >= 12) {
    const y = Math.floor(m / 12), rest = m % 12;
    return plural(y, 'year') + (rest ? ' ' + plural(rest, 'month') : '');
  }
  const parts = [];
  if (m) parts.push(plural(m, 'month'));
  if (d && (!hasTarget || m === 0)) parts.push(plural(d, 'day'));
  return parts.length ? parts.join(' ') : '0 days';
}

// Loan duration: 12+ months -> years and months; under a year -> months and days; under a month -> days.
function loanDuration(n) {
  let m = Math.floor(n), d = Math.round((n - m) * 30);
  if (d >= 30) { m += 1; d = 0; }
  if (m >= 12) {
    const y = Math.floor(m / 12), rest = m % 12;
    return plural(y, 'year') + (rest ? ' ' + plural(rest, 'month') : '');
  }
  const parts = [];
  if (m) parts.push(plural(m, 'month'));
  if (d) parts.push(plural(d, 'day'));
  return parts.length ? parts.join(' ') : '0 days';
}

const renderers = {
  savings: r => {
    const has = r.target_months !== undefined, name = esc(r.goal_name);
    let h = hero('Your goal', name) +
      stat('Monthly income', money(r.income)) +
      stat('Monthly expenses', money(r.expenses)) +
      stat('Monthly savings', money(r.available)) +
      stat(`${name} price`, money(r.goal_price)) +
      stat('Savings rate', r.savings_rate.toFixed(1) + '% of income') +
      stat(`Time needed for ${name}`, duration(r.months, has));
    if (has) h += stat('Your target', duration(r.target_months, true)) +
      stat('Needed per month for target', money(r.needed_per_month)) +
      `<span class="badge b-${r.comparison}">${r.comparison[0].toUpperCase() + r.comparison.slice(1)}</span>`;
    drawSavings(r);
    return h;
  },
  emi: r => { drawEmi(r);
    const left = r.remaining_months > 0.01 ? loanDuration(r.remaining_months) : 'Loan completed';
    return hero('Loan amount', money(r.principal)) + stat('Monthly EMI', money(r.emi)) +
      stat('Time to complete the loan', loanDuration(r.months_exact)) +
      stat('Total payable', money(r.total_payable)) + stat('Total interest', money(r.total_interest)) +
      stat(`Remaining after ${r.paid} EMIs`, money(r.remaining_balance)) +
      stat('Time left', left); },
  gst: r => { drawGst(r);
    const entered = r.mode === 'inclusive' ? r.total : r.base;
    return hero(`${esc(r.product)} price (${r.mode})`, money(entered)) +
      stat('Base price', money(r.base)) + stat(`GST (${r.rate}%)`, money(r.gst)) +
      stat('Total', money(r.total)); },
  percentage: r => { drawPct(r);
    const f = n => n.toLocaleString('en-IN', {maximumFractionDigits: 4});
    return hero('Percentage of total', `${r.percentage}% of ${f(r.total)}`) +
      stat('Value', f(r.value)) + stat('Remaining', f(r.remaining)); }
};

$$('form[data-api]').forEach(f => f.addEventListener('submit', async e => {
  e.preventDefault();
  const api = f.dataset.api, out = $('.result', f.closest('.grid'));
  const res = await fetch('/api/' + api, {method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(Object.fromEntries(new FormData(f)))});
  const data = await res.json();
  if (!res.ok) { out.innerHTML = `<p class="err">${data.error}</p>`; return; }
  out.innerHTML = renderers[api](data);
  const r = f.querySelector('button[type=submit]').getBoundingClientRect();
  Confetti.burst(r.left + r.width / 2, r.top + r.height / 2); showQuote(api);
  if (api === 'savings') {
    const bar = $('.bar', f.closest('.grid')); bar.hidden = false;
    requestAnimationFrame(() => $('i', bar).style.width = Math.min(data.savings_rate, 100) + '%');
  }
}));

$$('.chips button').forEach(b => b.onclick = () => {
  $$('.chips button').forEach(x => x.classList.toggle('on', x === b));
  $('#gstRate').value = b.textContent;
});
$('#gstRate').addEventListener('input', () => $$('.chips button').forEach(x => x.classList.remove('on')));

const modal = (id, open) => $('#' + id).hidden = !open;
$('#learnBtn').onclick = () => { renderLearn(lang); modal('learnModal', true); };
$('#askBtn').onclick = () => modal('askModal', true);
$$('.close').forEach(b => b.onclick = () => b.closest('.modal').hidden = true);
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.hidden = true; }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal').forEach(m => m.hidden = true); });

$$('.lang button').forEach(b => b.onclick = () => {
  lang = b.dataset.lang;
  $$('.lang button').forEach(x => x.classList.toggle('on', x === b));
  document.documentElement.lang = lang;
  const cur = $$('main > section').find(x => !x.hidden);
  if (cur && cur.id !== 'home') showQuote(cur.id);
  if (!$('#learnModal').hidden) renderLearn(lang);
  $('#chatInput').placeholder = lang === 'te' ? 'ఏదైనా అడగండి…' : 'Ask me anything…';
});

function addMsg(text, cls) {
  const d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text;
  $('#chatLog').appendChild(d); d.scrollIntoView({block: 'end'});
  return d;
}
$('#chatForm').onsubmit = async e => {
  e.preventDefault();
  const q = $('#chatInput').value.trim(); if (!q) return;
  const btn = $('#chatForm button'); btn.disabled = true;
  addMsg(q, 'u'); $('#chatInput').value = '';
  const wait = addMsg(lang === 'te' ? 'ఆలోచిస్తున్నాను…' : 'Thinking…', 'a');
  try {
    const res = await fetch('/api/ask-ai', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: q, lang})});
    const d = await res.json(); wait.textContent = d.answer || d.error;
  } catch (err) {
    wait.textContent = lang === 'te' ? 'నెట్‌వర్క్ సమస్య. మళ్ళీ ప్రయత్నించండి.' : 'Network problem. Please try again.';
  }
  btn.disabled = false; wait.scrollIntoView({block: 'end'});
};
