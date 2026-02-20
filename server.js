const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
const entries = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get all entries
app.get('/api/entries', (req, res) => {
  res.json(entries);
});

// Add a new entry
app.post('/api/entries', (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const entry = {
    id: entries.length + 1,
    name: name.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  entries.unshift(entry);
  res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`Guestbook server running at http://localhost:${PORT}`);
});
