const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' ? path.resolve(__dirname, 'test.sqlite') : path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    cookies_per_second INTEGER DEFAULT 0,
    upgrades TEXT DEFAULT '{}'
  )
`);

// Add columns if they don't exist
try {
  db.exec('ALTER TABLE users ADD COLUMN cookies_per_second INTEGER DEFAULT 0');
} catch (e) {}
try {
  db.exec("ALTER TABLE users ADD COLUMN upgrades TEXT DEFAULT '{}'");
} catch (e) {}



module.exports = db;
