const QUOTES = {
  savings: {
    en: ['Small savings today become big freedom tomorrow.',
         'Pay yourself first — your future self is counting on you.',
         'A goal without a plan is just a wish. You just made a plan.'],
    te: ['ఈరోజు చిన్న పొదుపు, రేపటి పెద్ద స్వేచ్ఛ.',
         'ముందు మీకోసం పొదుపు చేయండి — భవిష్యత్తు మీపైనే ఆధారపడి ఉంది.',
         'ప్రణాళిక లేని లక్ష్యం కేవలం కోరిక; మీరు ఇప్పుడే ప్రణాళిక వేశారు.']},
  emi: {
    en: ['Every EMI paid is a step closer to being debt-free.',
         'Borrow with a plan, repay with discipline.',
         'Know your numbers and your loan works for you, not against you.'],
    te: ['చెల్లించిన ప్రతి EMI అప్పు లేని జీవితానికి ఒక అడుగు.',
         'ప్రణాళికతో అప్పు తీసుకోండి, క్రమశిక్షణతో తిరిగి చెల్లించండి.',
         'లెక్కలు తెలిస్తే రుణం మీకు అనుకూలంగా పనిచేస్తుంది.']},
  gst: {
    en: ['Know the tax, own the price.',
         'Smart buyers read the price tag and the tax line.',
         'Clear numbers make confident decisions.'],
    te: ['పన్ను తెలుసుకోండి, ధరపై పట్టు సాధించండి.',
         'తెలివైన కొనుగోలుదారులు ధరతో పాటు పన్నును కూడా చూస్తారు.',
         'స్పష్టమైన లెక్కలు నమ్మకమైన నిర్ణయాలకు దారి తీస్తాయి.']},
  percentage: {
    en: ['Small percentages, repeated daily, build big results.',
         'Numbers tell the story — percentages make it clear.',
         'Progress is measured one percent at a time.'],
    te: ['రోజూ చిన్న శాతాలు కలిసి పెద్ద ఫలితాలను ఇస్తాయి.',
         'సంఖ్యలు కథ చెబుతాయి, శాతాలు దాన్ని స్పష్టం చేస్తాయి.',
         'ప్రగతిని ఒక్కో శాతంతో కొలవండి.']}
};
const lastQuote = {};
function showQuote(calc) {
  const el = document.querySelector(`#${calc} .quote`);
  if (!el) return;
  const list = QUOTES[calc][lang] || QUOTES[calc].en;
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastQuote[calc]);
  lastQuote[calc] = i;
  el.classList.remove('in'); void el.offsetWidth;   // restart the animation
  el.textContent = list[i];
  el.classList.add('in');
}
