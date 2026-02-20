const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const entriesList = document.getElementById('entries-list');

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createEntryElement(entry) {
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML =
    `<div class="entry-header">
      <span class="entry-name">${escapeHtml(entry.name)}</span>
      <span class="entry-time">${formatDate(entry.timestamp)}</span>
    </div>
    <p class="entry-message">${escapeHtml(entry.message)}</p>`;
  return div;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadEntries() {
  const res = await fetch('/api/entries');
  const entries = await res.json();
  if (entries.length === 0) {
    entriesList.innerHTML = '<p class="empty-state">No entries yet. Be the first to sign!</p>';
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
    entriesList.prepend(createEntryElement(entry));
    form.reset();
  }

  button.disabled = false;
});

loadEntries();
