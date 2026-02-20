const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const entriesList = document.getElementById('entries-list');
const entryCount = document.getElementById('entry-count');

const AVATAR_COLORS = [
  'linear-gradient(135deg, #7c5bf0, #6341d4)',
  'linear-gradient(135deg, #e45a84, #c0396a)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createEntryElement(entry) {
  const div = document.createElement('div');
  div.className = 'entry';
  const initials = getInitials(entry.name);
  const color = getAvatarColor(entry.name);
  div.innerHTML =
    `<div class="entry-avatar" style="background:${color}">${escapeHtml(initials)}</div>
    <div class="entry-body">
      <div class="entry-header">
        <span class="entry-name">${escapeHtml(entry.name)}</span>
        <span class="entry-time">${formatDate(entry.timestamp)}</span>
      </div>
      <p class="entry-message">${escapeHtml(entry.message)}</p>
    </div>`;
  return div;
}

function updateCount(count) {
  if (count > 0) {
    entryCount.textContent = `${count} ${count === 1 ? 'message' : 'messages'}`;
  } else {
    entryCount.textContent = '';
  }
}

async function loadEntries() {
  const res = await fetch('/api/entries');
  const entries = await res.json();
  updateCount(entries.length);
  if (entries.length === 0) {
    return;
  }
  entriesList.innerHTML = '';
  entries.forEach(entry => {
    entriesList.appendChild(createEntryElement(entry));
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;

  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInput.value,
      message: messageInput.value,
    }),
  });

  if (res.ok) {
    const entry = await res.json();
    const emptyState = entriesList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const el = createEntryElement(entry);
    entriesList.prepend(el);

    const allEntries = entriesList.querySelectorAll('.entry');
    updateCount(allEntries.length);

    form.classList.add('success');
    setTimeout(() => form.classList.remove('success'), 600);

    form.reset();
    nameInput.focus();
  }

  button.disabled = false;
});

loadEntries();
