/**
 * Resumé.AI — Frontend Script
 * Handles form state, dynamic fields, AI calls, preview, and PDF download.
 */

'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let enhancedData = null;

// ── DOM Ready ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSkillTags();
  initDynamicSections();
  initNavTabs();
  bindButtons();
  addProjectEntry();       // start with one empty row
  addExperienceEntry();
  addEducationEntry();
});

// ── Navigation Tabs (mobile) ─────────────────────────────────────────────────
function initNavTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.panel;
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`panel-${target}`)?.classList.add('active');
    });
  });
}

// ── Skill Tags ────────────────────────────────────────────────────────────────
function initSkillTags() {
  const input = document.getElementById('skills');
  const tagsContainer = document.getElementById('skillTags');

  input.addEventListener('keydown', e => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.replace(/,/g, '').trim();
      if (val) {
        addSkillTag(val, tagsContainer);
        input.value = '';
      }
    }
  });

  input.addEventListener('blur', () => {
    const val = input.value.replace(/,/g, '').trim();
    if (val) { addSkillTag(val, tagsContainer); input.value = ''; }
  });
}

function addSkillTag(text, container) {
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.dataset.value = text;
  tag.innerHTML = `${escHtml(text)}<button type="button" title="Remove" aria-label="Remove skill">×</button>`;
  tag.querySelector('button').addEventListener('click', () => tag.remove());
  container.appendChild(tag);
}

function getSkills() {
  const fromTags = [...document.querySelectorAll('#skillTags .skill-tag')]
    .map(t => t.dataset.value);
  const fromInput = document.getElementById('skills').value
    .split(',').map(s => s.trim()).filter(Boolean);
  return [...new Set([...fromTags, ...fromInput])];
}

// ── Dynamic Sections ──────────────────────────────────────────────────────────
function initDynamicSections() {
  document.getElementById('addProject').addEventListener('click', addProjectEntry);
  document.getElementById('addExperience').addEventListener('click', addExperienceEntry);
  document.getElementById('addEducation').addEventListener('click', addEducationEntry);
}

function addProjectEntry() {
  const container = document.getElementById('projectsList');
  const idx = container.children.length;
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">Project ${idx + 1}</span>
      <button class="remove-btn" type="button" title="Remove">×</button>
    </div>
    <div class="field-grid">
      <div class="field full">
        <label>Title</label>
        <input type="text" name="proj_title" placeholder="E.g. E-commerce Platform" />
      </div>
      <div class="field full">
        <label>Description</label>
        <textarea name="proj_desc" rows="2" placeholder="What did you build, solve, and achieve?"></textarea>
      </div>
      <div class="field full">
        <label>Tech Stack <span class="hint">(comma separated)</span></label>
        <input type="text" name="proj_tech" placeholder="React, Node.js, PostgreSQL" />
      </div>
    </div>`;
  card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
  container.appendChild(card);
}

function addExperienceEntry() {
  const container = document.getElementById('experienceList');
  const idx = container.children.length;
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">Experience ${idx + 1}</span>
      <button class="remove-btn" type="button" title="Remove">×</button>
    </div>
    <div class="field-grid two-col">
      <div class="field">
        <label>Company</label>
        <input type="text" name="exp_company" placeholder="Acme Corp" />
      </div>
      <div class="field">
        <label>Role / Title</label>
        <input type="text" name="exp_role" placeholder="Senior Engineer" />
      </div>
      <div class="field full">
        <label>Duration</label>
        <input type="text" name="exp_duration" placeholder="Jan 2022 – Present" />
      </div>
      <div class="field full">
        <label>Key Responsibilities / Achievements <span class="hint">(one per line)</span></label>
        <textarea name="exp_bullets" rows="3" placeholder="Built REST API handling 1M+ requests/day&#10;Reduced deploy time by 40%"></textarea>
      </div>
    </div>`;
  card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
  container.appendChild(card);
}

function addEducationEntry() {
  const container = document.getElementById('educationList');
  const idx = container.children.length;
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">Education ${idx + 1}</span>
      <button class="remove-btn" type="button" title="Remove">×</button>
    </div>
    <div class="field-grid two-col">
      <div class="field full">
        <label>Institution</label>
        <input type="text" name="edu_institution" placeholder="University of Technology" />
      </div>
      <div class="field">
        <label>Degree</label>
        <input type="text" name="edu_degree" placeholder="B.Sc. Computer Science" />
      </div>
      <div class="field">
        <label>Dates</label>
        <input type="text" name="edu_dates" placeholder="2019 – 2023" />
      </div>
      <div class="field full">
        <label>Location</label>
        <input type="text" name="edu_location" placeholder="City" />
      </div>
    </div>`;
  card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
  container.appendChild(card);
}

// ── Collect Form Data ─────────────────────────────────────────────────────────
function collectFormData() {
  return {
    name:     getVal('name'),
    email:    getVal('email'),
    phone:    getVal('phone'),
    linkedin: getVal('linkedin'),
    address:  getVal('address'),
    github:   getVal('github'),
    summary:  getVal('summary'),
    skills:   getSkills(),
    projects: collectProjects(),
    experience: collectExperience(),
    education:  collectEducation(),
    additional: collectAdditional(),
    template: document.getElementById('templateSelect').value,
  };
}

function collectProjects() {
  return [...document.querySelectorAll('#projectsList .item-card')].map(card => {
    const name = card.querySelector('[name=proj_title]').value.trim();
    const tech = card.querySelector('[name=proj_tech]').value.trim();
    const bullets = card.querySelector('[name=proj_desc]').value
      .split('\n').map(s => s.trim()).filter(Boolean);
    return { name, tech, bullets };
  }).filter(p => p.name);
}

function collectExperience() {
  return [...document.querySelectorAll('#experienceList .item-card')].map(card => ({
    title:    card.querySelector('[name=exp_role]').value.trim(),
    company:  card.querySelector('[name=exp_company]').value.trim(),
    duration: card.querySelector('[name=exp_duration]').value.trim(),
    bullets:  card.querySelector('[name=exp_bullets]').value.split('\n').map(s=>s.trim()).filter(Boolean),
  })).filter(e => e.title || e.company);
}

function collectEducation() {
  return [...document.querySelectorAll('#educationList .item-card')].map(card => ({
    institution: card.querySelector('[name=edu_institution]').value.trim(),
    degree:      card.querySelector('[name=edu_degree]').value.trim(),
    location:    card.querySelector('[name=edu_location]')?.value.trim() || '',
    dates:       card.querySelector('[name=edu_dates]')?.value.trim() || '',
  })).filter(e => e.institution || e.degree);
}

function collectAdditional() {
  const additional = [];
  const languages = getVal('languages');
  const developerTools = getVal('developer_tools');
  const certs = getVal('certifications').split(',').map(s => s.trim()).filter(Boolean);
  if (languages) additional.push({ label: 'Languages', value: languages });
  if (developerTools) additional.push({ label: 'Developer Tools', value: developerTools });
  if (certs.length) additional.push({ label: 'Certifications', value: certs.join(', ') });
  return additional;
}

// ── Buttons ───────────────────────────────────────────────────────────────────
function bindButtons() {
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);
  document.getElementById('downloadBtn').addEventListener('click', handleDownload);
  document.getElementById('refreshPreview').addEventListener('click', handleGenerate);
  document.getElementById('templateSelect').addEventListener('change', () => {
    if (enhancedData) { enhancedData.template = document.getElementById('templateSelect').value; handleGenerate(); }
  });
}

// ── Generate & Preview ────────────────────────────────────────────────────────
async function handleGenerate() {
  const data = enhancedData || collectFormData();
  data.template = document.getElementById('templateSelect').value;

  if (!data.name || !data.email) { showToast('Please fill in at least Name and Email.', 'error'); return; }

  showLoading('Building your CV…');
  setStatusLoading();
  try {
    await updatePreview(data);
    document.getElementById('downloadBtn').disabled = false;
    showToast('CV preview ready!', 'success');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    hideLoading();
    setStatusReady();
  }
}

async function updatePreview(data) {
  const res = await fetch('/preview-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Preview failed');

  const frame = document.getElementById('previewFrame');
  const empty = document.getElementById('previewEmpty');
  frame.style.display = 'block';
  empty.style.display = 'none';

  const blob = new Blob([json.html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  frame.src  = url;

  // Switch to preview on mobile
  document.querySelector('.nav-btn[data-panel=preview]')?.click();
}

// ── Download PDF ──────────────────────────────────────────────────────────────
async function handleDownload() {
  const data = enhancedData || collectFormData();
  data.template = document.getElementById('templateSelect').value;

  showLoading('Generating PDF…');
  try {
    const res = await fetch('/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'PDF generation failed');
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(data.name || 'cv').replace(/\s+/g, '_')}_CV.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('PDF downloaded!', 'success');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    hideLoading();
  }
}

// ── Populate Form after AI Enhancement ───────────────────────────────────────
function populateFormWithEnhanced(data) {
  setVal('summary', data.summary || '');
  setVal('address', data.address || '');

  // Map additional[] back to fields
  const additional = Array.isArray(data.additional) ? data.additional : [];
  const langItem = additional.find(x => (x?.label || '').toLowerCase() === 'languages');
  const toolsItem = additional.find(x => (x?.label || '').toLowerCase() === 'developer tools');
  const certItem = additional.find(x => (x?.label || '').toLowerCase() === 'certifications');
  setVal('languages', (langItem?.value || ''));
  setVal('developer_tools', (toolsItem?.value || ''));
  setVal('certifications', (certItem?.value || ''));

  // Skills
  document.getElementById('skillTags').innerHTML = '';
  const skillsContainer = document.getElementById('skillTags');
  (data.skills || []).forEach(s => addSkillTag(s, skillsContainer));
  document.getElementById('skills').value = '';

  // Projects
  const projContainer = document.getElementById('projectsList');
  projContainer.innerHTML = '';
  (data.projects || []).forEach((p, i) => {
    addProjectEntry();
    const cards = projContainer.querySelectorAll('.item-card');
    const card  = cards[cards.length - 1];
    card.querySelector('.card-title').textContent = `Project ${i + 1}`;
    card.querySelector('[name=proj_title]').value = p.name || '';
    card.querySelector('[name=proj_desc]').value  = (p.bullets || []).join('\n');
    card.querySelector('[name=proj_tech]').value  = p.tech || '';
  });

  // Experience
  const expContainer = document.getElementById('experienceList');
  expContainer.innerHTML = '';
  (data.experience || []).forEach((e, i) => {
    addExperienceEntry();
    const cards = expContainer.querySelectorAll('.item-card');
    const card  = cards[cards.length - 1];
    card.querySelector('.card-title').textContent  = `Experience ${i + 1}`;
    card.querySelector('[name=exp_company]').value  = e.company || '';
    card.querySelector('[name=exp_role]').value     = e.title || '';
    card.querySelector('[name=exp_duration]').value = e.duration || '';
    card.querySelector('[name=exp_bullets]').value  = (e.bullets || []).join('\n');
  });

  // Education
  const eduContainer = document.getElementById('educationList');
  eduContainer.innerHTML = '';
  (data.education || []).forEach((e, i) => {
    addEducationEntry();
    const cards = eduContainer.querySelectorAll('.item-card');
    const card  = cards[cards.length - 1];
    card.querySelector('.card-title').textContent  = `Education ${i + 1}`;
    card.querySelector('[name=edu_institution]').value  = e.institution || '';
    card.querySelector('[name=edu_degree]').value       = e.degree || '';
    card.querySelector('[name=edu_location]').value     = e.location || '';
    card.querySelector('[name=edu_dates]').value        = e.dates || '';
  });
}


// ── UI Helpers ────────────────────────────────────────────────────────────────
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

function showLoading(msg = 'Processing…') {
  document.getElementById('loadingMsg').textContent = msg;
  document.getElementById('loadingOverlay').classList.add('active');
}
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('active'); }

function setStatusLoading() {
  const dot  = document.querySelector('.status-dot');
  const text = document.querySelector('#previewStatus span:last-child');
  dot.className  = 'status-dot loading';
  text.textContent = 'Generating…';
}
function setStatusReady() {
  const dot  = document.querySelector('.status-dot');
  const text = document.querySelector('#previewStatus span:last-child');
  dot.className  = 'status-dot ready';
  text.textContent = 'Preview ready';
}

let toastTimer;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
