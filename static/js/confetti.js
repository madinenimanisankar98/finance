// Rupee-symbol confetti: Confetti.rain(3000) for card clicks, Confetti.burst(x, y) for Calculate
const Confetti = (() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.id = 'confetti';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const cols = ['#FB7185', '#FBBF24', '#A7F3D0', '#FDBA74', '#5EEAD4', '#BBF7D0', '#FCA5A5'];
  let parts = [], running = false, last = 0;
  const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
  size(); addEventListener('resize', size);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function add(x, y, vx, vy, life) {
    parts.push({x, y, vx, vy, life, age: 0, r: rnd(0, 6.28), vr: rnd(-.25, .25),
                s: rnd(14, 30), c: cols[Math.floor(rnd(0, cols.length))]});
  }
  function frame(now) {
    const dt = Math.min((now - last) / 16.67, 3); last = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.age < p.life);
    for (const p of parts) {
      p.age += dt; p.vy += .22 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (p.life - p.age) / (p.life * .3));
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.font = `700 ${p.s}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('₹', 0, 0);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
  function start() {
    if (running) return;
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }
  return {
    // Falling shower from the top; about `ms` milliseconds in total
    rain(ms = 3000) {
      if (still) return;
      const end = performance.now() + Math.max(ms - 1000, 0);
      const t = setInterval(() => {
        for (let i = 0; i < 3; i++) add(rnd(0, cv.width), -20, rnd(-1.5, 1.5), rnd(2, 5), 62);
        if (performance.now() > end) clearInterval(t);
      }, 30);
      start();
    },
    // Quick burst from a point; about 1 second
    burst(x, y) {
      if (still) return;
      for (let i = 0; i < 80; i++) {
        const a = rnd(-Math.PI, 0), v = rnd(4, 11);
        add(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(45, 60));
      }
      start();
    }
  };
})();
