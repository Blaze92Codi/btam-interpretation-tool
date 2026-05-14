const themes = [
  { key: 'directThreat', label: 'Direct threat or concerning statement', words: ['kill','shoot','stab','bomb','hurt','threat','you will be sorry','watch what happens'] },
  { key: 'target', label: 'Possible target or named person/place', words: ['target','teacher','student','school','principal','classroom','bus','game','tomorrow'] },
  { key: 'grievance', label: 'Grievance / perceived injustice', words: ['unfair','revenge','payback','bullied','hate','grievance','wronged','justice'] },
  { key: 'escalation', label: 'Escalation or worsening pattern', words: ['increasing','escalating','more often','worse','recently','again','repeated','pattern'] },
  { key: 'fixation', label: 'Fixation / obsession', words: ['obsessed','fixated','keeps talking','cannot let go','repeated posts','stalking','harassing'] },
  { key: 'planning', label: 'Planning, preparation, or pathway behavior', words: ['plan','planned','list','map','schedule','searched','practice','rehearsed','approach'] },
  { key: 'access', label: 'Access concern / weapon / means', words: ['gun','weapon','knife','access','ammo','firearm','explosive','means'] },
  { key: 'leakage', label: 'Leakage / warning shared with others', words: ['posted','texted','told a friend','social media','message','snap','discord','leakage'] },
  { key: 'stressors', label: 'Stressors / loss / crisis', words: ['breakup','loss','suspended','expelled','fired','death','family','crisis','homeless','divorce'] },
  { key: 'isolation', label: 'Isolation or withdrawal', words: ['isolated','withdrawn','alone','no friends','stopped attending','missing school'] },
  { key: 'selfHarm', label: 'Self-harm or suicide concern', words: ['suicide','self harm','die','kill myself','worthless','no reason to live'] },
  { key: 'protective', label: 'Protective factor / support present', words: ['parent involved','counselor','trusted adult','cooperative','support','connected','willing'] }
];
const themeChecks = document.getElementById('themeChecks');
themes.forEach(t => {
  const label = document.createElement('label');
  label.className = 'check';
  label.innerHTML = `<input type="checkbox" value="${t.key}"> ${t.label}`;
  themeChecks.appendChild(label);
});
function val(id){ return document.getElementById(id).value.trim(); }
function detectThemes(text){
  const lower = text.toLowerCase();
  return themes.filter(t => t.words.some(w => lower.includes(w))).map(t => t.key);
}
function labelFor(key){ return themes.find(t=>t.key===key)?.label || key; }
function concernLevel(keys){
  const high = ['directThreat','planning','access'];
  const moderate = ['target','grievance','escalation','fixation','leakage','selfHarm'];
  const highCount = keys.filter(k=>high.includes(k)).length;
  const modCount = keys.filter(k=>moderate.includes(k)).length;
  if (keys.includes('directThreat') && keys.includes('access') && keys.includes('planning')) return ['Critical / Immediate Review','Stop normal workflow. Notify the appropriate school administrator and emergency/safety partners according to local policy.'];
  if (highCount >= 2 || (keys.includes('directThreat') && (keys.includes('target') || keys.includes('escalation')))) return ['High / Same-Day Team Review','Same-day BTAM review is needed. Focus on safety, target protection, supervision, parent/guardian contact, and law-enforcement threshold review.'];
  if (modCount >= 2 || keys.includes('selfHarm')) return ['Moderate / Prompt Review','Prompt BTAM review is needed. Organize facts, interview appropriate sources, connect supports, and set a close follow-up date.'];
  if (keys.length >= 1) return ['Low / Monitor with Support','Document and monitor. Add support, watch for change, and confirm follow-up ownership.'];
  return ['Routine / Insufficient Information','Not enough facts are entered. Do not assume risk. Gather basic facts and monitor for changes.'];
}
function fiveYearOld(keys){
  const parts = [];
  if(keys.includes('directThreat')) parts.push('Someone said or wrote something that may scare people.');
  if(keys.includes('target')) parts.push('There may be a person or place the concern is connected to.');
  if(keys.includes('grievance')) parts.push('The person may feel hurt, angry, or treated unfairly.');
  if(keys.includes('escalation')) parts.push('The behavior may be getting bigger, louder, or happening more often.');
  if(keys.includes('planning')) parts.push('There may be signs the person is thinking ahead about what to do.');
  if(keys.includes('access')) parts.push('The team must ask whether the person can get to anything that could hurt someone.');
  if(keys.includes('protective')) parts.push('There are helpers or strengths that can lower concern if they are real and active.');
  return parts.length ? parts.join(' ') : 'We do not have enough clues yet. Adults should gather facts before deciding what this means.';
}
function actionSteps(keys){
  const steps = ['Document the exact concern using observable facts only.','Identify what is known, unknown, and who can verify it.'];
  if(keys.includes('directThreat')) steps.push('Clarify exact words, context, audience, target, and timing.');
  if(keys.includes('target')) steps.push('Protect and support any possible target while facts are reviewed.');
  if(keys.includes('access')) steps.push('Follow local policy to assess access to weapons/means and involve safety partners if threshold is met.');
  if(keys.includes('selfHarm')) steps.push('Use school suicide/self-harm protocol and mental health review immediately.');
  if(keys.includes('stressors') || keys.includes('grievance')) steps.push('Connect the person to supportive measures, not only discipline.');
  steps.push('Assign one owner and one follow-up date before closing the meeting.');
  return steps;
}
function generate(){
  const text = val('assessmentText');
  const checked = [...document.querySelectorAll('#themeChecks input:checked')].map(x=>x.value);
  const detected = detectThemes(text);
  const keys = [...new Set([...checked, ...detected])];
  const [level, interpretation] = concernLevel(keys);
  const output = `BTAM ANALYZER READER SUMMARY\n\nCase / Concern:\n${val('caseName') || 'Unnamed Concern'}\n\nSetting:\n${val('setting')}\n\nAssessment Reference Type:\n${val('toolType')}\n\nFive-Year-Old Translation:\n${fiveYearOld(keys)}\n\nPlain-Language Meaning:\nThis is not a prediction. It is a structured safety and support review. The team should organize behavior, context, escalation, protective factors, missing information, immediate safety needs, and follow-up.\n\nDetected / Selected Themes:\n${keys.length ? keys.map(k=>' - '+labelFor(k)).join('\n') : ' - No themes detected or selected.'}\n\nCurrent Interpretation:\n${level}: ${interpretation}\n\nWhat The Team Should Ask Next:\n - What exactly happened?\n - Who saw it, heard it, received it, or reported it?\n - Was there a target, time, place, or plan?\n - Is the concern new, repeated, or escalating?\n - What stressors or grievances are present?\n - What protective supports are real and active?\n - What facts are still missing?\n\nMissing Facts / Unknowns Entered:\n${val('unknowns') || '[No missing facts entered]'}\n\nProtective Factors / Strengths Entered:\n${val('protective') || '[No protective factors entered]'}\n\nImmediate Management Actions:\n${actionSteps(keys).map(s=>' - '+s).join('\n')}\n\nSupportive Measures / Treatment Direction:\n - Increase adult connection and supervision where appropriate.\n - Consider counselor, social worker, parent/guardian, community mental health, or other support referral.\n - Match response to facts; avoid overreaction and avoid ignoring the concern.\n - Use supportive measures in addition to any discipline when appropriate.\n\nFollow-Up Assignment:\nOwner: ${val('owner') || '[No owner assigned]'}\nDate: ${val('date') || '[No follow-up date assigned]'}\n\nProof-of-Care Statement:\nConcern received → facts organized → themes identified → unknowns listed → action assigned → support considered → follow-up scheduled → human BTAM team review required.\n\nSafety / Use Disclaimer:\nThis output is a documentation aid. It does not diagnose, predict violence, replace a BTAM team, replace law enforcement, replace mental-health judgment, or replace legal/regulatory review. Use trained, authorized professionals, verified facts, applicable law, and local policy.`;
  document.getElementById('output').textContent = output;
}
document.getElementById('analyzeBtn').addEventListener('click', generate);
document.getElementById('copyBtn').addEventListener('click', ()=>navigator.clipboard.writeText(document.getElementById('output').textContent));
document.getElementById('clearBtn').addEventListener('click', ()=>location.reload());
