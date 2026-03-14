const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./_lib/db');
const { JWT_SECRET } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const db = await getDb();
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.collection('users').insertOne({
      username,
      password_hash: hash,
      created_at: new Date(),
    });
    const token = jwt.sign({ id: result.insertedId.toString(), username }, JWT_SECRET);
    res.json({ token, username });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
