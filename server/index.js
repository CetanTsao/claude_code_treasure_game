const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'treasure-game-secret-key';

app.use(cors());
app.use(express.json());

// Middleware: verify JWT token
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/signup
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(username, hash);
    const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET);
    res.json({ token, username });
  } catch {
    res.status(409).json({ error: 'Username already taken' });
  }
});

// POST /api/signin
app.post('/api/signin', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({ token, username: user.username });
});

// POST /api/scores — save a score for the authenticated user
app.post('/api/scores', authenticate, (req, res) => {
  const { score } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'Score required' });
  db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)').run(req.user.id, score);
  res.json({ ok: true });
});

// GET /api/scores — get score history for the authenticated user
app.get('/api/scores', authenticate, (req, res) => {
  const scores = db
    .prepare('SELECT score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 10')
    .all(req.user.id);
  res.json(scores);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
