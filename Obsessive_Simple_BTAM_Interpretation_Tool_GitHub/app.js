function val(id) {
  return document.getElementById(id).value.trim();
}

function selectedThemes() {
  return Array.from(document.querySelectorAll('#themes input:checked')).map(cb => cb.value);
}

function levelText(level) {
  const map = {
    routine: 'Routine / Monitor: document, observe for change, and maintain normal support unless new facts emerge.',
    low: 'Low Concern: concern is present, but current facts do not show immediate safety urgency. Continue documentation and support.',
    moderate: 'Moderate Concern: credible concern requires team review, verification of unknowns, support planning, and scheduled monitoring.',
    high: 'High Concern: significant concern requires prompt team action, safety planning, leadership notification, and documented follow-up.',
    critical: 'Critical / Immediate Safety Action: pause routine workflow and activate emergency/safety procedures, law enforcement, crisis response, or administrative authority as appropriate.'
  };
  return map[level] || map.routine;
}

function generateInterpretation() {
  const caseName = val('caseName') || 'Unnamed Concern';
  const setting = val('setting');
  const toolType = val('toolType');
  const behavior = val('reportedBehavior') || '[No reported behavior entered]';
  const context = val('context') || '[No known context entered]';
  const themes = selectedThemes();
  const missing = val('missingFacts') || '[No missing facts entered]';
  const level = document.getElementById('concernLevel').value;
  const immediate = val('immediateActions') || '[No immediate actions entered]';
  const support = val('supportiveMeasures') || '[No supportive measures entered]';
  const owner = val('owner') || '[No owner assigned]';
  const due = val('dueDate') || '[No follow-up date assigned]';

  const themeText = themes.length ? themes.map(t => `- ${t}`).join('\n') : '- No specific themes selected. Team should review facts and avoid assumptions.';

  const output = `BTAM ASSESSMENT INTERPRETATION SUMMARY\n\nCase / Concern:\n${caseName}\n\nSetting:\n${setting}\n\nAssessment Reference Type:\n${toolType}\n\nPlain-Language Meaning:\nThis concern should be interpreted as a structured safety and support issue, not as a prediction. The current facts should be organized around observable behavior, context, escalation, protective factors, and missing information.\n\nReported Behavior / Concern:\n${behavior}\n\nKnown Context:\n${context}\n\nObserved Themes:\n${themeText}\n\nCurrent Concern Interpretation:\n${levelText(level)}\n\nMissing Facts / Unknowns:\n${missing}\n\nImmediate Management Actions:\n${immediate}\n\nSupportive Measures / Treatment Direction:\n${support}\n\nFollow-Up Assignment:\nOwner: ${owner}\nDate: ${due}\n\nDocumentation Statement:\nThis output is a documentation aid for team review. It does not diagnose, predict violence, replace a BTAM team, replace law enforcement, replace mental-health judgment, or replace legal/regulatory review. Final decisions must be made by trained, authorized professionals using verified facts and applicable policy.\n\nProof-of-Care Logic:\nConcern received → facts organized → unknowns identified → concern interpreted → action assigned → support considered → follow-up scheduled → human review required.`;

  document.getElementById('output').textContent = output;
}

async function copyOutput() {
  const text = document.getElementById('output').textContent;
  try {
    await navigator.clipboard.writeText(text);
    alert('Output copied.');
  } catch (e) {
    alert('Copy failed. Select the output text and copy manually.');
  }
}

function clearForm() {
  document.querySelectorAll('input, textarea').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  document.getElementById('concernLevel').value = 'routine';
  document.getElementById('output').textContent = 'Complete the form and click Generate Interpretation.';
}
