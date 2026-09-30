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

const renderers = {
  savings: r => {
    let h = stat('Goal', r.goal_name) + stat('Available Savings / month', money(r.available)) +
      stat('Estimated Time', `${r.years}y ${r.months_part}m ${r.days}d (${r.months.toFixed(1)} months)`);
    if (r.comparison) h += stat('Needed / month for target', money(r.needed_per_month)) +
      `<span class="badge b-${r.comparison}">${r.comparison[0].toUpperCase() + r.comparison.slice(1)}</span>`;
    drawSavings(r);
    return h;
  },
  emi: r => { drawEmi(r);
    return stat('Monthly EMI', money(r.emi)) + stat('Total Payable', money(r.total_payable)) +
      stat('Total Interest', money(r.total_interest)) +
      stat(`Remaining after ${r.paid} EMIs`, money(r.remaining_balance)); },
  gst: r => { drawGst(r);
    return stat(r.product, r.mode) + stat('Base Price', money(r.base)) +
      stat(`GST (${r.rate}%)`, money(r.gst)) + stat('Total', money(r.total)); },
  percentage: r => { drawPct(r);
    return stat(`${r.percentage}% of ${r.total}`, r.value.toLocaleString('en-IN', {maximumFractionDigits: 4})) +
      stat('Remaining', r.remaining.toLocaleString('en-IN', {maximumFractionDigits: 4})); }
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
  $('#chatInput').placeholder = lang === 'te' ? 'పొదుపు, EMI, GST, శాతాల గురించి అడగండి…' : 'Ask about savings, EMI, GST, percentages…';
});

function addMsg(text, cls) {
  const d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text;
  $('#chatLog').appendChild(d); d.scrollIntoView({block: 'end'});
}
$('#chatForm').onsubmit = async e => {
  e.preventDefault();
  const q = $('#chatInput').value.trim(); if (!q) return;
  addMsg(q, 'u'); $('#chatInput').value = '';
  const res = await fetch('/api/ask-ai', {method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({question: q, lang})});
  const d = await res.json(); addMsg(d.answer || d.error, 'a');
};
