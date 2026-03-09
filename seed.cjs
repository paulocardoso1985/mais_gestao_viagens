const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new Database(dbPath);

console.log('Seeding database with advanced user...');

// Reset users table for clean seeding if needed, or just insert
db.prepare('DELETE FROM users').run();

const insertUser = db.prepare(`
    INSERT INTO users (username, pin, name, role, email) 
    VALUES (?, ?, ?, ?, ?)
`);

insertUser.run('paulo', '1234', 'Paulo Cardoso', 'ADMIN', 'paulo@maiscorporativo.com.br');

console.log('Database seeded with admin user.');
db.close();
