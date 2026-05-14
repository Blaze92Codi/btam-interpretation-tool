const themes = [
  { key:'directThreat', weight:4, label:'Direct threat or concerning statement', words:['kill','shoot','stab','bomb','hurt','threat','you will be sorry','watch what happens','make them pay','bring a gun'] },
  { key:'target', weight:3, label:'Possible target, location, or event identified', words:['target','teacher','student','school','principal','classroom','bus','game','tomorrow','cafeteria','hallway','specific person','named'] },
  { key:'grievance', weight:2, label:'Grievance / perceived injustice', words:['unfair','revenge','payback','bullied','hate','grievance','wronged','justice','humiliated','picked on'] },
  { key:'escalation', weight:3, label:'Escalation or worsening pattern', words:['increasing','escalating','more often','worse','recently','again','repeated','pattern','more intense'] },
  { key:'fixation', weight:3, label:'Fixation / obsession', words:['obsessed','fixated','keeps talking','cannot let go','repeated posts','stalking','harassing','preoccupied'] },
  { key:'planning', weight:4, label:'Planning, preparation, or pathway behavior', words:['plan','planned','list','map','schedule','searched','practice','rehearsed','approach','route','time to arrive'] },
  { key:'access', weight:4, label:'Access concern / weapon / means', words:['gun','weapon','knife','access','ammo','firearm','explosive','means','rifle','pistol'] },
  { key:'leakage', weight:3, label:'Leakage / warning shared with others', words:['posted','texted','told a friend','social media','message','snap','discord','leakage','sent a note','group chat'] },
  { key:'stressors', weight:2, label:'Stressors / loss / crisis', words:['breakup','loss','suspended','expelled','fired','death','family','crisis','homeless','divorce','grades','discipline'] },
  { key:'isolation', weight:2, label:'Isolation or withdrawal', words:['isolated','withdrawn','alone','no friends','stopped attending','missing school','not showing up'] },
  { key:'selfHarm', weight:4, label:'Self-harm or suicide concern', words:['suicide','self harm','self-harm','die','kill myself','worthless','no reason to live','end it'] },
  { key:'protective', weight:-1, label:'Protective factor / support present', words:['parent involved','counselor','trusted adult','cooperative','support','connected','willing','engaged','guardian'] }
];

const sampleCase = `Training Test Case Only - No real student information.
A student told a peer, "You will be sorry tomorrow," after an argument in the hallway. The peer reported feeling unsafe to a teacher. No weapon was seen. The reporting teacher stated the student has appeared increasingly isolated and angry over the last two weeks. The student has been disciplined twice this month for peer conflict. A counselor knows the student and reports the student has one trusted adult at school. Parent/guardian contact has not occurred yet. Unknowns include exact wording, whether there is a target, access to weapons, prior threats, and whether the student has posted anything online.`;

const themeChecks = document.getElementById('themeChecks');
themes.forEach(t => {
  const label = document.createElement('label');
  label.className = 'check';
  label.innerHTML = `<input type="checkbox" value="${t.key}"> ${t.label}`;
  themeChecks.appendChild(label);
});

function val(id){ return document.getElementById(id).value.trim(); }
function labelFor(key){ return themes.find(t=>t.key===key)?.label || key; }
function getTheme(key){ return themes.find(t=>t.key===key); }
function detectThemes(text){
  const lower = text.toLowerCase();
  return themes.filter(t => t.words.some(w => lower.includes(w))).map(t => t.key);
}
function selectedThemes(){ return [...document.querySelectorAll('#themeChecks input:checked')].map(x=>x.value); }
function allThemeKeys(){
  const checked = selectedThemes();
  const detected = detectThemes(val('assessmentText'));
  return [...new Set([...checked, ...detected])];
}
function textHasAny(text, arr){ const lower=text.toLowerCase(); return arr.some(w=>lower.includes(w)); }

function concernLevel(keys, text){
  const high = ['directThreat','planning','access'];
  const moderate = ['target','grievance','escalation','fixation','leakage','selfHarm'];
  const highCount = keys.filter(k=>high.includes(k)).length;
  const modCount = keys.filter(k=>moderate.includes(k)).length;
  const imminent = textHasAny(text, ['today','tomorrow','right now','after school','this afternoon','this morning','next period']);

  if ((keys.includes('directThreat') && keys.includes('access') && keys.includes('planning')) || (keys.includes('directThreat') && keys.includes('access') && imminent)) {
    return ['CRITICAL / Immediate Safety Review', 'Stop normal workflow. Follow local emergency/safety procedures and notify authorized safety partners according to policy.'];
  }
  if (highCount >= 2 || (keys.includes('directThreat') && (keys.includes('target') || keys.includes('escalation') || imminent))) {
    return ['HIGH / Same-Day BTAM Review', 'Same-day BTAM review is needed. Focus on immediate safety, target support, supervision, parent/guardian contact, and law-enforcement threshold review.'];
  }
  if (modCount >= 2 || keys.includes('selfHarm') || (keys.includes('grievance') && keys.includes('stressors'))) {
    return ['MODERATE / Prompt Team Review', 'Prompt BTAM review is needed. Organize facts, interview appropriate sources, connect supports, and set a close follow-up date.'];
  }
  if (keys.length >= 1) return ['LOW / Monitor With Support', 'Document and monitor. Add support, watch for change, and confirm follow-up ownership.'];
  return ['ROUTINE / Insufficient Information', 'Not enough facts are entered. Do not assume risk. Gather basic facts and monitor for changes.'];
}

function professionalSummary(keys){
  const parts = [];
  if(keys.includes('directThreat')) parts.push('The documentation includes language that may represent a direct threat or concerning statement.');
  if(keys.includes('target')) parts.push('The concern may involve an identifiable person, place, event, or school setting that needs clarification.');
  if(keys.includes('grievance')) parts.push('The available facts suggest a grievance or perceived injustice may be part of the concern.');
  if(keys.includes('escalation')) parts.push('The pattern may be worsening, repeating, or increasing in intensity.');
  if(keys.includes('fixation')) parts.push('The concern may include fixation, repeated focus, or difficulty disengaging from the issue.');
  if(keys.includes('planning')) parts.push('The information may suggest planning, preparation, or pathway behavior that requires immediate clarification.');
  if(keys.includes('access')) parts.push('The team must clarify access to weapons, means, tools, or other capability concerns according to policy.');
  if(keys.includes('leakage')) parts.push('The concern may have been communicated to peers, online, by message, or through another warning pathway.');
  if(keys.includes('stressors')) parts.push('Current stressors or losses may be increasing concern and should be addressed through support, not only discipline.');
  if(keys.includes('isolation')) parts.push('Isolation or withdrawal may reduce protective connection and should be reviewed.');
  if(keys.includes('selfHarm')) parts.push('Self-harm or suicide language requires the appropriate mental-health/suicide-response protocol.');
  if(keys.includes('protective')) parts.push('Protective factors are present, but the team should verify that they are current, active, and reliable.');
  return parts.length ? parts.join(' ') : 'The documentation does not contain enough specific behavioral information to support an interpretation yet. The next step is to gather observable facts and verify context.';
}

function dataQuality(keys){
  const text = val('assessmentText');
  let score = 0;
  const checks = [
    ['case name', !!val('caseName')],
    ['assessment narrative', text.length > 40],
    ['themes detected or selected', keys.length > 0],
    ['protective factors noted', !!val('protective') || keys.includes('protective')],
    ['unknowns listed', !!val('unknowns')],
    ['follow-up owner assigned', !!val('owner')],
    ['follow-up date assigned', !!val('date')],
    ['specific timing/context present', textHasAny(text, ['today','tomorrow','yesterday','week','month','morning','afternoon','after school','at'])],
    ['source or reporter context present', textHasAny(text, ['reported','teacher','peer','parent','guardian','staff','administrator','counselor','sro'])]
  ];
  checks.forEach(c => { if(c[1]) score += 1; });
  return { score: Math.round((score / checks.length) * 100), checks };
}

function generatedMissingQuestions(keys){
  const questions = [
    'What exactly was said, written, posted, or done?',
    'Who reported it, who observed it, and what source can verify it?',
    'When did it happen, and is the timing immediate or future-oriented?',
    'Is there a specific target, location, event, or group?',
    'Is this new behavior, repeated behavior, or escalation from prior concerns?',
    'What protective factors are active right now?'
  ];
  if(keys.includes('directThreat')) questions.push('Was the statement conditional, joking, impulsive, rehearsed, specific, or repeated?');
  if(keys.includes('access')) questions.push('Is there credible information about access to weapons, means, or tools?');
  if(keys.includes('planning')) questions.push('Is there evidence of planning, preparation, research, lists, maps, timing, or approach behavior?');
  if(keys.includes('leakage')) questions.push('Who received the message or warning, and are there screenshots or original records?');
  if(keys.includes('selfHarm')) questions.push('Has the suicide/self-harm protocol been activated and documented?');
  return questions;
}

function actionSteps(keys){
  const steps = ['Document observable facts only; avoid labels, assumptions, and unsupported conclusions.', 'Separate verified facts from rumors, interpretations, and unknowns.', 'Identify what must be answered before the case can be responsibly downgraded or closed.'];
  if(keys.includes('directThreat')) steps.push('Clarify exact words, context, audience, target, timing, and whether the statement was repeated or shared.');
  if(keys.includes('target')) steps.push('Provide appropriate support and safety consideration for any possible target while facts are reviewed.');
  if(keys.includes('access')) steps.push('Follow local policy to review access to weapons/means and involve authorized safety partners when threshold is met.');
  if(keys.includes('planning')) steps.push('Review for pathway behavior: preparation, research, timing, access, approach, and leakage.');
  if(keys.includes('selfHarm')) steps.push('Activate the appropriate school mental-health/suicide/self-harm protocol immediately.');
  if(keys.includes('stressors') || keys.includes('grievance') || keys.includes('isolation')) steps.push('Connect the person to supportive measures and trusted adults; do not rely on discipline alone.');
  steps.push('Assign one owner, one due date, and one next team review point before ending the meeting.');
  return steps;
}

function supportDirection(keys){
  const supports = ['Match support to the facts and documented needs.', 'Increase trusted adult connection and structured check-ins where appropriate.', 'Consider parent/guardian contact, counselor/social worker review, and school-based support planning.', 'Use supportive measures along with any discipline when appropriate.'];
  if(keys.includes('grievance')) supports.push('Address grievance drivers through problem-solving, mediation, conflict support, or restorative options if appropriate.');
  if(keys.includes('stressors')) supports.push('Review stressors such as discipline, loss, family issues, academic pressure, peer conflict, or major change.');
  if(keys.includes('isolation')) supports.push('Build safe connection points during transitions, lunch, arrival/dismissal, or other vulnerable times.');
  if(keys.includes('selfHarm')) supports.push('Use qualified mental-health review and applicable suicide/self-harm safety procedures.');
  if(keys.includes('protective')) supports.push('Verify protective factors are current, active, reliable, and connected to a named adult or support system.');
  return supports;
}

function followUpRecommendation(level){
  if(level.startsWith('CRITICAL')) return 'Immediate review and continuous monitoring until stabilized per policy.';
  if(level.startsWith('HIGH')) return 'Same school day follow-up; reconvene before end of day when possible.';
  if(level.startsWith('MODERATE')) return 'Prompt follow-up within 24–48 hours or sooner if facts change.';
  if(level.startsWith('LOW')) return 'Scheduled monitoring within 3–5 school days, with earlier review if new facts emerge.';
  return 'Basic documentation review; follow local routine monitoring procedures.';
}

function updateQualityBar(score){
  document.querySelector('#qualityBar span').style.width = `${score}%`;
  document.getElementById('qualityLabel').textContent = `Data completeness: ${score}% — ${score >= 80 ? 'strong enough for team review packet' : score >= 55 ? 'usable but missing key facts' : 'early-stage information; gather more facts before interpreting heavily'}.`;
}

function generate(){
  const text = val('assessmentText');
  const keys = allThemeKeys();
  const [level, interpretation] = concernLevel(keys, text);
  const q = dataQuality(keys);
  updateQualityBar(q.score);
  const missingFlags = q.checks.filter(c=>!c[1]).map(c=>c[0]);

  const output = `BTAM ASSESSMENT ANALYZER READER SUMMARY\n\nCase / Concern:\n${val('caseName') || 'Unnamed Training Concern'}\n\nSetting:\n${val('setting')}\n\nAssessment Reference Type:\n${val('toolType')}\n\nProfessional Plain-Language Interpretation:\n${professionalSummary(keys)}\n\nCurrent Concern Interpretation:\n${level}: ${interpretation}\n\nAutomated Theme Scan:\n${keys.length ? keys.map(k=>' - '+labelFor(k)).join('\n') : ' - No concern themes detected or selected.'}\n\nData Completeness Check:\nScore: ${q.score}%\nMissing or weak fields: ${missingFlags.length ? missingFlags.join(', ') : 'none identified by the demo checker'}\n\nWhat This Means for School Officials:\n - This is a structured safety-and-support review, not a prediction.\n - The team should slow the case down, verify facts, and avoid assumptions.\n - The goal is early intervention: identify what changed, what support is needed, and what follow-up prevents the concern from being dropped.\n\nCritical Questions the Team Should Answer Next:\n${generatedMissingQuestions(keys).map(s=>' - '+s).join('\n')}\n\nMissing Facts / Unknowns Entered by User:\n${val('unknowns') || '[No missing facts entered]'}\n\nProtective Factors / Strengths Entered by User:\n${val('protective') || '[No protective factors entered]'}\n\nImmediate Management Actions:\n${actionSteps(keys).map(s=>' - '+s).join('\n')}\n\nSupportive Intervention Direction:\n${supportDirection(keys).map(s=>' - '+s).join('\n')}\n\nRecommended Follow-Up Timing:\n${followUpRecommendation(level)}\n\nFollow-Up Assignment:\nOwner: ${val('owner') || '[No owner assigned]'}\nDate: ${val('date') || '[No follow-up date assigned]'}\n\nTeam Review Script:\n1. What facts are verified?\n2. What facts are still missing?\n3. What immediate safety or support action is required today?\n4. Who owns each action item?\n5. When does the team check back?\n\nProof-of-Care Statement:\nConcern received → facts organized → themes identified → unknowns listed → action assigned → support considered → follow-up scheduled → human BTAM team review required.\n\nSafety / Use Disclaimer:\nThis output is a documentation aid. It does not diagnose, predict violence, replace a BTAM team, replace law enforcement, replace mental-health judgment, or replace legal/regulatory review. Use trained, authorized professionals, verified facts, applicable law, and local policy.`;
  document.getElementById('output').textContent = output;
}

function loadFile(file){
  if(!file) return;
  const allowed = ['txt','md','csv','json'];
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if(!allowed.includes(ext)){
    document.getElementById('fileStatus').textContent = 'Unsupported file type. Use .txt, .md, .csv, or .json for the public demo.';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('assessmentText').value = e.target.result;
    document.getElementById('fileStatus').textContent = `Loaded: ${file.name}`;
    if(!val('caseName')) document.getElementById('caseName').value = file.name.replace(/\.[^/.]+$/, '');
  };
  reader.onerror = () => document.getElementById('fileStatus').textContent = 'File could not be read.';
  reader.readAsText(file);
}

function downloadOutput(){
  const text = document.getElementById('output').textContent;
  const name = (val('caseName') || 'BTAM_Analyzer_Output').replace(/[^a-z0-9_-]+/gi,'_');
  const blob = new Blob([text], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('fileInput').addEventListener('change', e => loadFile(e.target.files[0]));
document.getElementById('demoBtn').addEventListener('click', () => {
  document.getElementById('caseName').value = '26-0514-Training-Concern-001';
  document.getElementById('assessmentText').value = sampleCase;
  document.getElementById('protective').value = 'Counselor knows the student. One trusted adult at school has been identified. Student may be willing to talk if approached calmly.';
  document.getElementById('unknowns').value = 'Exact wording, target, access to weapons, prior threats, parent/guardian contact, online posts, and current supervision plan.';
  document.getElementById('owner').value = 'BTAM Chair / Assistant Principal';
  document.getElementById('fileStatus').textContent = 'Loaded built-in sample test case.';
});
document.getElementById('analyzeBtn').addEventListener('click', generate);
document.getElementById('copyBtn').addEventListener('click', async () => {
  await navigator.clipboard.writeText(document.getElementById('output').textContent);
  document.getElementById('copyBtn').textContent = 'Copied';
  setTimeout(()=>document.getElementById('copyBtn').textContent='Copy', 1200);
});
document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('clearBtn').addEventListener('click', () => location.reload());
