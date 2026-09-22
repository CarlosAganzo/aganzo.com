const REPO = 'CarlosAganzo/aganzo.com';
const BRANCH = 'main';
const CONTENT_PATH = 'assets/data/now.json';
const API_FILE = `https://api.github.com/repos/${REPO}/contents/${CONTENT_PATH}`;
const API_USER = 'https://api.github.com/user';
const PUBLIC_NOW = '/assets/data/now.json';
const SESSION_KEY = 'aganzo-admin-github-token';

const slots = [
  { label: 'watching', title: 'Watching' },
  { label: 'listening', title: 'Listening' },
  { label: 'reading', title: 'Reading' },
  { label: 'obsession', title: 'Current obsession' }
];

const tokenInput = document.getElementById('github-token');
const connectButton = document.getElementById('connect-github');
const forgetButton = document.getElementById('forget-github');
const authStatus = document.getElementById('auth-status');
const saveButton = document.getElementById('save-now');
const reloadButton = document.getElementById('reload-now');
const saveStatus = document.getElementById('save-status');
const updatedEl = document.getElementById('now-updated');
const preview = document.getElementById('now-preview-items');
const cards = [...document.querySelectorAll('.admin-card')];

let token = '';
let originalItems = [];
let loading = false;

function setStatus(el, message, kind = '') {
  el.textContent = message;
  el.classList.toggle('is-good', kind === 'good');
  el.classList.toggle('is-bad', kind === 'bad');
}

function getFields(card) {
  return {
    value: card.querySelector('.now-value-input'),
    url: card.querySelector('.now-url-input')
  };
}

function currentItems() {
  return cards.map((card, index) => {
    const fields = getFields(card);
    const value = fields.value.value.trim();
    const url = fields.url.value.trim();
    const original = originalItems[index];
    return {
      label: slots[index].label,
      value,
      valueKey: original && original.value === value ? (original.valueKey || null) : null,
      url
    };
  });
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validate() {
  const items = currentItems();
  const complete = items.every(item => item.value && safeUrl(item.url));
  saveButton.disabled = !token || !complete || loading;
  return complete;
}

function renderPreview() {
  preview.replaceChildren();
  currentItems().forEach((item, index) => {
    const a = document.createElement('a');
    a.className = 'now-item';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.href = safeUrl(item.url) ? item.url : '#';
    if (!item.value || !safeUrl(item.url)) a.setAttribute('aria-disabled', 'true');

    const label = document.createElement('span');
    label.className = 'micro';
    label.textContent = slots[index].title;

    const value = document.createElement('strong');
    value.textContent = item.value || '—';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';

    a.append(label, value, arrow);
    preview.append(a);
  });
  validate();
}

function setForm(data) {
  originalItems = Array.isArray(data.items) ? data.items.map(item => ({ ...item })) : [];
  cards.forEach((card, index) => {
    const item = data.items?.[index] || {};
    const fields = getFields(card);
    fields.value.value = item.value || '';
    fields.url.value = item.url || '';
  });
  updatedEl.textContent = data.updated || '—';
  renderPreview();
}

async function loadPublished() {
  loading = true;
  validate();
  setStatus(saveStatus, 'Loading published data…');
  try {
    const response = await fetch(`${PUBLIC_NOW}?admin=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Published data returned ${response.status}`);
    const data = await response.json();
    setForm(data);
    setStatus(saveStatus, 'Published data loaded.', 'good');
  } catch (error) {
    setStatus(saveStatus, `Could not load Now: ${error.message}`, 'bad');
  } finally {
    loading = false;
    validate();
  }
}

function apiHeaders(candidate = token) {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${candidate}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function connect(candidate) {
  const clean = candidate.trim();
  if (!clean) {
    setStatus(authStatus, 'Paste a GitHub token first.', 'bad');
    return;
  }

  connectButton.disabled = true;
  setStatus(authStatus, 'Checking GitHub access…');
  try {
    const response = await fetch(API_USER, { headers: apiHeaders(clean) });
    if (!response.ok) throw new Error(response.status === 401 ? 'Token rejected by GitHub.' : `GitHub returned ${response.status}.`);
    const user = await response.json();

    const fileResponse = await fetch(`${API_FILE}?ref=${encodeURIComponent(BRANCH)}`, { headers: apiHeaders(clean), cache: 'no-store' });
    if (!fileResponse.ok) {
      if (fileResponse.status === 403) throw new Error('Token is valid, but it cannot read this repository. Check repository access and Contents permission.');
      throw new Error(`Repository check returned ${fileResponse.status}.`);
    }

    token = clean;
    sessionStorage.setItem(SESSION_KEY, token);
    tokenInput.value = '';
    tokenInput.placeholder = 'Connected for this session';
    tokenInput.disabled = true;
    forgetButton.hidden = false;
    connectButton.hidden = true;
    setStatus(authStatus, `Connected as ${user.login}. Token stays only in this browser session.`, 'good');
  } catch (error) {
    token = '';
    sessionStorage.removeItem(SESSION_KEY);
    setStatus(authStatus, error.message, 'bad');
  } finally {
    connectButton.disabled = false;
    validate();
  }
}

function disconnect() {
  token = '';
  sessionStorage.removeItem(SESSION_KEY);
  tokenInput.disabled = false;
  tokenInput.value = '';
  tokenInput.placeholder = 'github_pat_…';
  forgetButton.hidden = true;
  connectButton.hidden = false;
  setStatus(authStatus, 'Not connected. You can still edit and preview locally.');
  validate();
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function saveNow() {
  if (!token) {
    setStatus(saveStatus, 'Connect GitHub before publishing.', 'bad');
    return;
  }
  if (!validate()) {
    setStatus(saveStatus, 'Every item needs a title and a valid http(s) link.', 'bad');
    return;
  }

  loading = true;
  validate();
  setStatus(saveStatus, 'Publishing…');

  try {
    const metaResponse = await fetch(`${API_FILE}?ref=${encodeURIComponent(BRANCH)}&t=${Date.now()}`, {
      headers: apiHeaders(),
      cache: 'no-store'
    });

    if (!metaResponse.ok) {
      if (metaResponse.status === 403) throw new Error('GitHub refused the write credentials. Check Contents: read and write permission.');
      throw new Error(`Could not read current file metadata (${metaResponse.status}).`);
    }

    const current = await metaResponse.json();
    const updated = new Date().toISOString().slice(0, 10);
    const data = {
      updated,
      items: currentItems()
    };
    const content = JSON.stringify(data, null, 2) + '\n';

    const saveResponse = await fetch(API_FILE, {
      method: 'PUT',
      headers: {
        ...apiHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update Now from site admin (${updated})`,
        content: toBase64(content),
        sha: current.sha,
        branch: BRANCH
      })
    });

    if (!saveResponse.ok) {
      const detail = await saveResponse.json().catch(() => ({}));
      if (saveResponse.status === 403) throw new Error('GitHub refused the commit. The token needs Contents: read and write permission.');
      if (saveResponse.status === 409) throw new Error('The file changed while you were editing. Reload published data and try again.');
      throw new Error(detail.message || `GitHub returned ${saveResponse.status}.`);
    }

    originalItems = data.items.map(item => ({ ...item }));
    updatedEl.textContent = updated;
    setStatus(saveStatus, 'Published. The homepage will use the new data on its next load.', 'good');
  } catch (error) {
    setStatus(saveStatus, error.message, 'bad');
  } finally {
    loading = false;
    validate();
  }
}

cards.forEach(card => {
  const fields = getFields(card);
  fields.value.addEventListener('input', renderPreview);
  fields.url.addEventListener('input', renderPreview);
});

connectButton.addEventListener('click', () => connect(tokenInput.value));
tokenInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') connect(tokenInput.value);
});
forgetButton.addEventListener('click', disconnect);
reloadButton.addEventListener('click', loadPublished);
saveButton.addEventListener('click', saveNow);

await loadPublished();

const remembered = sessionStorage.getItem(SESSION_KEY);
if (remembered) await connect(remembered);
