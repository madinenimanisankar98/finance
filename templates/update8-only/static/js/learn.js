async function renderLearn(lang) {
  const data = await (await fetch('/api/learn')).json();
  const L = lang === 'te'
    ? {f:'సూత్రం', t:'పదాలు', e:'ఉదాహరణ', p:'చిట్కా'} : {f:'Formula', t:'Terms', e:'Example', p:'Tip'};
  document.getElementById('learnBody').innerHTML = Object.values(data).map(x => {
    const c = x[lang] || x.en;
    return `<div class="learn"><h3>${c.title}</h3><b>${L.f}</b><pre>${c.formula}</pre>` +
      `<p><b>${L.t}:</b> ${c.terms}</p><p><b>${L.e}:</b> ${c.example}</p><p><b>${L.p}:</b> ${c.tip}</p></div>`;
  }).join('');
}
