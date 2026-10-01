// Rupee-symbol confetti. Style: burst from the clicked element, sway rotation, 0.7x speed.
//   Confetti.burst(x, y, 3000)  -> card click (about 3 seconds)
//   Confetti.burst(x, y)        -> Calculate button (about 1 second)
const Confetti = (() => {
  const SPEED = 0.7;                        // 1 = normal, lower = slower
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
    parts.push({x, y, vx, vy, life, age: 0, ph: rnd(0, 6.28),
                s: rnd(14, 30), c: cols[Math.floor(rnd(0, cols.length))]});
  }
  function frame(now) {
    const dt = Math.min((now - last) / 16.67, 3) * SPEED; last = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.age < p.life);
    for (const p of parts) {
      p.age += dt; p.vy += .22 * dt;
      p.x += (p.vx + Math.sin(p.age * .12 + p.ph) * 1.4) * dt;   // leaf-like side drift
      p.y += p.vy * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (p.life - p.age) / (p.life * .3));
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(p.age * .12 + p.ph) * .5);              // sway tilt
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
    burst(x, y, ms = 1000) {
      if (still) return;
      const n = ms > 1500 ? 120 : 80;
      for (let i = 0; i < n; i++) {
        const a = rnd(-Math.PI, 0), v = rnd(4, 11);
        add(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(.75, 1) * (ms / 16.67) * SPEED);
      }
      start();
    }
  };
})();
