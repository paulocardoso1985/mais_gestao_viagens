const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path for Docker persistence (Volume mount point)
const dbDir = process.env.NODE_ENV === 'production' ? '/app/data' : '.';
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'data.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    pin TEXT,
    name TEXT,
    role TEXT,
    email TEXT
  );

  -- Add email to users if it doesn't exist (defensive)
  PRAGMA foreign_keys=OFF;
  BEGIN TRANSACTION;
  CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    pin TEXT,
    name TEXT,
    role TEXT,
    email TEXT
  );
  INSERT INTO users_new (id, username, pin, name, role) 
  SELECT id, username, pin, name, role FROM users;
  DROP TABLE users;
  ALTER TABLE users_new RENAME TO users;
  COMMIT;

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    passport TEXT,
    passportPhoto TEXT,
    city TEXT,
    uf TEXT,
    airport TEXT,
    tour TEXT,
    allergies TEXT,
    emergency_name TEXT,
    emergency_phone TEXT,
    titularName TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    dateGroup TEXT,
    startDate TEXT,
    endDate TEXT,
    time TEXT,
    action TEXT, -- Use as subject/activity
    responsible TEXT,
    coResponsible TEXT,
    agent TEXT,
    observation TEXT,
    status TEXT,
    history TEXT,
    category TEXT, -- For checklist grouping
    sort_order INTEGER,
    module TEXT -- To help keep things organized if needed later, but shared for now
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user TEXT,
    action TEXT,
    details TEXT,
    module TEXT,
    item TEXT
  );
`);

module.exports = db;
