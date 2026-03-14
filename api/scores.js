const { ObjectId } = require('mongodb');
const { getDb } = require('./_lib/db');
const { verifyToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  let user;
  try {
    user = verifyToken(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const scores = await db.collection('scores')
        .find({ user_id: user.id })
        .sort({ played_at: -1 })
        .limit(10)
        .toArray();
      return res.json(scores.map(s => ({ score: s.score, played_at: s.played_at })));
    }

    if (req.method === 'POST') {
      const { score } = req.body;
      if (score === undefined) return res.status(400).json({ error: 'Score required' });
      await db.collection('scores').insertOne({ user_id: user.id, score, played_at: new Date() });
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
