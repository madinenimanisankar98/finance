(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sym = ['₹','$','€','£','¥'], cols = ['#FB7185','#FBBF24','#A7F3D0','#FDBA74','#BBF7D0'];
  const box = document.getElementById('symbols');
  for (let i = 0; i < 36; i++) {
    const s = document.createElement('span');
    s.textContent = sym[i % 5];
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `font-size:${12 + Math.random()*14}px;color:${cols[Math.floor(Math.random()*5)]};` +
      `animation-duration:${20 + Math.random()*40}s;--dir:${Math.random() < .5 ? '' : '-'}1turn`;
    box.appendChild(s);
  }
})();
