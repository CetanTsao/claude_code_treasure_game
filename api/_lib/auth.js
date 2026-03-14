const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'treasure-game-secret-key';

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return jwt.verify(auth.slice(7), JWT_SECRET);
}

module.exports = { verifyToken, JWT_SECRET };
