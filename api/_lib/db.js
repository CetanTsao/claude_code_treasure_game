const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db('treasure_game');
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
  }
  return db;
}

module.exports = { getDb };
