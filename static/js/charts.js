const charts = {};
function draw(id, config) {
  if (typeof Chart === 'undefined') return;
  if (charts[id]) charts[id].destroy();
  Chart.defaults.color = COLORS.text;
  charts[id] = new Chart(document.getElementById(id), config);
}
const scales = {x:{grid:{color:COLORS.grid}}, y:{grid:{color:COLORS.grid}, beginAtZero:true}};
const doughnut = (labels, data, colors, cutout='60%') => ({type:'doughnut',
  data:{labels, datasets:[{data, backgroundColor:colors, borderWidth:0}]}, options:{cutout}});

function drawSavings(r) {
  draw('c-sav1', doughnut(['Expenses','Savings'], [r.expenses, r.available], [COLORS.coral, COLORS.mint]));
  const n = Math.min(Math.ceil(r.months), 60), labels = [], saved = [], goal = [];
  for (let i = 0; i <= n; i++) { labels.push(i); saved.push(r.available * i); goal.push(r.goal_price); }
  draw('c-sav2', {type:'line', data:{labels, datasets:[
    {label:'Saved', data:saved, borderColor:COLORS.mint, tension:.2},
    {label:'Goal', data:goal, borderColor:COLORS.coral, borderDash:[6,6], pointRadius:0}]},
    options:{scales}});
}
function drawEmi(r) {
  draw('c-emi1', doughnut(['Principal','Interest'], [r.principal, r.total_interest], [COLORS.amber, COLORS.coral]));
  draw('c-emi2', {type:'line', data:{labels:r.schedule.map((_, i) => i + 1),
    datasets:[{label:'Remaining balance', data:r.schedule, borderColor:COLORS.amber, tension:.2, pointRadius:0}]},
    options:{scales}});
}
function drawGst(r) {
  draw('c-gst', {type:'bar', data:{labels:['Base Price','GST'],
    datasets:[{data:[r.base, r.gst], backgroundColor:[COLORS.teal, COLORS.coral]}]},
    options:{plugins:{legend:{display:false}}, scales}});
}
function drawPct(r) {
  draw('c-pct', doughnut([r.percentage + '%','Rest'], [r.value, r.remaining], [COLORS.teal, 'rgba(230,251,248,.15)'], '72%'));
}
