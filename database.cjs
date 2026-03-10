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
    type TEXT, -- 'Titular' or 'Acompanhante'
    name TEXT,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    birthday TEXT,
    gender TEXT,
    nationality TEXT,
    passport TEXT,
    passportIssueDate TEXT,
    passportExpiryDate TEXT,
    passportPhoto TEXT,
    usVisa TEXT, -- 'Sim' or 'Não'
    usVisaExpiry TEXT,
    city TEXT,
    uf TEXT,
    airport TEXT,
    tour TEXT, -- 'City Tour', 'Cavernas Drach', 'Tarde Livre'
    allergies TEXT,
    restrictions TEXT,
    medicalConditions TEXT,
    mobilityAssistance TEXT, -- 'Sim' or 'Não'
    mobilityDetails TEXT,
    emergencyName TEXT,
    emergencyRelationship TEXT,
    emergencyPhone TEXT,
    titularName TEXT, -- Link Acompanhante to Titular
    status TEXT DEFAULT 'Confirmado'
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

// Seed default admin if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
    db.prepare('INSERT INTO users (username, pin, name, role, email) VALUES (?, ?, ?, ?, ?)')
      .run('paulo', '1234', 'Paulo Cardoso', 'ADMIN', 'paulo@maiscorporativo.com.br');
}

// Seed demo participants if empty
const participantCount = db.prepare('SELECT COUNT(*) as count FROM participants').get().count;
if (participantCount === 0) {
    console.log('Seeding demo participants...');
    const firstNames = ['ADRIANA', 'ALEXSANDRA', 'ANA', 'ANDRESSA', 'BEATRIZ', 'BRUNA', 'CAMILA', 'CRISTIANE', 'DANIELA', 'DEBORA', 'ELIANA', 'FERNANDA', 'FLAVIA', 'GABRIELA', 'HELOISA', 'ISABELA', 'JESSICA', 'JULIANA', 'LARISSA', 'LETICIA', 'LUANA', 'MARCELA', 'MARIA', 'NATALIA', 'PATRICIA', 'PAULA', 'RAFAELA', 'RENATA', 'ROBERTA', 'SABRINA', 'TATIANE', 'VANESSA', 'VITÓRIA'];
    const lastNames = ['SILVA', 'SANTOS', 'OLIVEIRA', 'SOUZA', 'RODRIGUES', 'FERREIRA', 'ALVES', 'PEREIRA', 'LIMA', 'GOMES', 'COSTA', 'RIBEIRO', 'MARTINS', 'CARVALHO', 'ALMEIDA', 'LOPES', 'SOARES', 'FERNANDES', 'VIEIRA', 'BARBOSA', 'ROCHA', 'DIAS', 'NASCIMENTO', 'ANDRADE', 'MOREIRA', 'NUNES', 'MARQUES', 'MACHADO', 'MENDES', 'FREITAS', 'CARDOSO', 'RAMOS', 'TEIXEIRA'];
    const maleFirstNames = ['ALEXANDRE', 'ANDRÉ', 'ANTONIO', 'BRUNO', 'CARLOS', 'DANIEL', 'DIEGO', 'EDUARDO', 'FELIPE', 'FERNANDO', 'GABRIEL', 'GUSTAVO', 'HENRIQUE', 'IGOR', 'JOÃO', 'JOSÉ', 'LEANDRO', 'LUCAS', 'LUIZ', 'MARCELO', 'MARCOS', 'MATHEUS', 'PAULO', 'PEDRO', 'RAFAEL', 'RICARDO', 'RODRIGO', 'SAMUEL', 'THIAGO', 'TIAGO', 'VINICIUS', 'VITOR'];
    const cities = [
        { city: 'SÃO PAULO', uf: 'SP', airport: 'GRU' }, { city: 'RIO DE JANEIRO', uf: 'RJ', airport: 'GIG' },
        { city: 'CURITIBA', uf: 'PR', airport: 'CWB' }, { city: 'BELO HORIZONTE', uf: 'MG', airport: 'CNF' },
        { city: 'PORTO ALEGRE', uf: 'RS', airport: 'POA' }, { city: 'SALVADOR', uf: 'BA', airport: 'SSA' },
        { city: 'FORTALEZA', uf: 'CE', airport: 'FOR' }, { city: 'BRASÍLIA', uf: 'DF', airport: 'BSB' }
    ];
    const tours = ['City Tour', 'Cavernas Drach', 'Tarde Livre'];

    const insert = db.prepare(`
        INSERT INTO participants (
            id, type, name, email, phone, cpf, birthday, gender, nationality,
            passport, passportIssueDate, passportExpiryDate, passportPhoto,
            usVisa, usVisaExpiry, city, uf, airport, tour, allergies,
            restrictions, medicalConditions, mobilityAssistance, mobilityDetails,
            emergencyName, emergencyRelationship, emergencyPhone, titularName, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        for (let i = 0; i < 60; i++) {
            const isMale = Math.random() > 0.5;
            const name = `${isMale ? maleFirstNames[i % maleFirstNames.length] : firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${lastNames[(i + 5) % lastNames.length]}`;
            const cityObj = cities[i % cities.length];
            insert.run(
                Math.random().toString(36).substr(2, 9), 'Titular', name, name.toLowerCase().replace(/ /g, '.') + '@demo.com', 
                '11999999999', '00000000000', '10/10/1985', isMale ? 'Masculino' : 'Feminino', 'BRASILEIRA',
                'G12345678', '01/01/2020', '01/01/2030', 'demo.jpg', 'Não', '', cityObj.city, cityObj.uf, cityObj.airport,
                tours[i % tours.length], '', '', '', 'Não', '', 'CONTATO', 'PARENTE', '1188888888', '', 'Confirmado'
            );
        }
    })();
}

module.exports = db;
