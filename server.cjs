const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database.cjs');
const path = require('path');
const { sendEmail } = require('./mailer.cjs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Mais Corporativo API is running' });
});

// --- AUTH ---
app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
});

app.post('/api/auth/login', (req, res) => {
    const { username, pin } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND pin = ?').get(username, pin);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
});

app.post('/api/auth/change-pin', (req, res) => {
    const { username, pin } = req.body;
    try {
        db.prepare('UPDATE users SET pin = ? WHERE username = ?').run(pin, username);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- USER MANAGEMENT (ADMIN ONLY) ---
app.post('/api/users', (req, res) => {
    const { username, pin, name, role, email } = req.body;
    try {
        const result = db.prepare('INSERT INTO users (username, pin, name, role, email) VALUES (?, ?, ?, ?, ?)')
            .run(username, pin, name, role || 'USER', email || '');
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/users/:id', (req, res) => {
    const { username, pin, name, role, email } = req.body;
    try {
        db.prepare('UPDATE users SET username = ?, pin = ?, name = ?, role = ?, email = ? WHERE id = ?')
            .run(username, pin, name, role, email, req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PARTICIPANTS ---
app.get('/api/participants', (req, res) => {
    const participants = db.prepare('SELECT * FROM participants').all();
    res.json(participants);
});

app.post('/api/participants/import', (req, res) => {
    const { data } = req.body; 
    const insert = db.prepare(`
        INSERT OR REPLACE INTO participants (
            id, type, name, email, phone, cpf, birthday, gender, nationality,
            passport, passportIssueDate, passportExpiryDate, passportPhoto,
            usVisa, usVisaExpiry, city, uf, airport, tour, allergies,
            restrictions, medicalConditions, mobilityAssistance, mobilityDetails,
            emergencyName, emergencyRelationship, emergencyPhone, titularName, status
        ) VALUES (
            @id, @type, @name, @email, @phone, @cpf, @birthday, @gender, @nationality,
            @passport, @passportIssueDate, @passportExpiryDate, @passportPhoto,
            @usVisa, @usVisaExpiry, @city, @uf, @airport, @tour, @allergies,
            @restrictions, @medicalConditions, @mobilityAssistance, @mobilityDetails,
            @emergencyName, @emergencyRelationship, @emergencyPhone, @titularName, @status
        )
    `);

    const transaction = db.transaction((items) => {
        for (const item of items) {
            insert.run({
                id: item.id || Math.random().toString(36).substr(2, 9),
                type: item.type || 'Titular',
                name: item.name || '',
                email: item.email || '',
                phone: item.phone || '',
                cpf: item.cpf || '',
                birthday: item.birthday || '',
                gender: item.gender || '',
                nationality: item.nationality || '',
                passport: item.passport || '',
                passportIssueDate: item.passportIssueDate || '',
                passportExpiryDate: item.passportExpiryDate || '',
                passportPhoto: item.passportPhoto || '',
                usVisa: item.usVisa || 'Não',
                usVisaExpiry: item.usVisaExpiry || '',
                city: (item.city || '').toUpperCase(),
                uf: (item.uf || '').toUpperCase(),
                airport: (item.airport || '').toUpperCase(),
                tour: item.tour || 'Pendente',
                allergies: item.allergies || '',
                restrictions: item.restrictions || '',
                medicalConditions: item.medicalConditions || '',
                mobilityAssistance: item.mobilityAssistance || 'Não',
                mobilityDetails: item.mobilityDetails || '',
                emergencyName: item.emergencyName || '',
                emergencyRelationship: item.emergencyRelationship || '',
                emergencyPhone: item.emergencyPhone || '',
                titularName: item.titularName || '',
                status: item.status || 'Confirmado'
            });
        }
    });

    transaction(data);
    res.json({ success: true, count: data.length });
});

// Register new participant
app.post('/api/participants', (req, res) => {
    const p = req.body;
    
    // Check for duplicate CPF
    if (p.cpf) {
        const existing = db.prepare('SELECT id FROM participants WHERE cpf = ?').get(p.cpf);
        if (existing) {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }
    }

    const id = p.id || Math.random().toString(36).substr(2, 9);

    const insert = db.prepare(`
        INSERT INTO participants (
            id, type, name, email, phone, cpf, birthday, gender, nationality,
            passport, passportIssueDate, passportExpiryDate, passportPhoto,
            usVisa, usVisaExpiry, city, uf, airport, tour, allergies,
            restrictions, medicalConditions, mobilityAssistance, mobilityDetails,
            emergencyName, emergencyRelationship, emergencyPhone, titularName, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
        insert.run(
            id, p.type || 'Titular', p.name, p.email, p.phone, p.cpf, p.birthday, p.gender, p.nationality,
            p.passport, p.passportIssueDate, p.passportExpiryDate, p.passportPhoto || '',
            p.usVisa || 'Não', p.usVisaExpiry || '', p.city, p.uf, p.airport, p.tour || 'Pendente',
            p.allergies || '', p.restrictions || '', p.medicalConditions || '', 
            p.mobilityAssistance || 'Não', p.mobilityDetails || '',
            p.emergencyName || '', p.emergencyRelationship || '', p.emergencyPhone || '',
            p.titularName || '', p.status || 'Confirmado'
        );
        res.status(201).json({ id, message: 'Sucesso!' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao salvar participante.' });
    }
});

app.delete('/api/participants/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM participants WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- TASKS (UNIFIED) ---
app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, id ASC').all();
    res.json(tasks);
});

// Alias for backwards compatibility if needed during transition
app.get('/api/timeline', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, id ASC').all();
    res.json(tasks);
});
app.get('/api/checklist', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, id ASC').all();
    res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
    const task = req.body;
    const { currentUser } = req.query;

    const isNew = !task.id;
    const oldTask = isNew ? null : db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);

    const insert = db.prepare(`
        INSERT OR REPLACE INTO tasks (
            id, dateGroup, startDate, endDate, time, action, responsible, 
            coResponsible, agent, observation, status, history, category, sort_order, module
        ) VALUES (
            @id, @dateGroup, @startDate, @endDate, @time, @action, @responsible, 
            @coResponsible, @agent, @observation, @status, @history, @category, @sort_order, @module
        )
    `);

    if (isNew) {
        const last = db.prepare('SELECT MAX(CAST(id AS INTEGER)) as maxId FROM tasks').get();
        task.id = (parseInt(last.maxId || 0) + 1).toString();
    }

    // Audit trail
    let auditLog = '';
    if (isNew) {
        auditLog = `Tarefa incluída por ${currentUser || 'Sistema'}`;
    } else {
        const changes = [];
        if (oldTask.status !== task.status) changes.push(`Status: ${oldTask.status} -> ${task.status}`);
        if (oldTask.endDate !== task.endDate) changes.push(`Prazos: ${oldTask.endDate} -> ${task.endDate}`);
        if (oldTask.responsible !== task.responsible) changes.push(`Responsável: ${oldTask.responsible} -> ${task.responsible}`);
        if (changes.length > 0) {
            auditLog = `Alterada por ${currentUser || 'Sistema'}: ${changes.join(', ')}`;
        }
    }

    if (auditLog) {
        const now = new Date().toLocaleString('pt-BR');
        task.history = task.history ? `${task.history}\n[${now}] ${auditLog}` : `[${now}] ${auditLog}`;
    }

    insert.run({
        ...task,
        dateGroup: task.dateGroup || task.startDate || '',
        action: task.action || task.subject || '', // Handle legacy 'subject'
        coResponsible: task.coResponsible || '',
        agent: task.agent || '',
        observation: task.observation || '',
        history: task.history || '',
        category: task.category || '',
        sort_order: task.sort_order || 0,
        module: task.module || ''
    });

    if (auditLog) {
        db.prepare('INSERT INTO logs (user, action, details, module, item) VALUES (?, ?, ?, ?, ?)')
            .run(currentUser || 'Sistema', isNew ? 'CREATE' : 'UPDATE', auditLog, 'Tarefas', task.action || task.subject);
    }

    res.json({ success: true, id: task.id });
});

// Keep legacy post routes for now
app.post('/api/timeline', (req, res) => app._router.handle({ method: 'post', url: '/api/tasks', body: req.body, query: req.query }, res));
app.post('/api/checklist', (req, res) => app._router.handle({ method: 'post', url: '/api/tasks', body: req.body, query: req.query }, res));

app.delete('/api/tasks/:id', (req, res) => {
    const { currentUser } = req.query;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (task) {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
        db.prepare('INSERT INTO logs (user, action, details, module, item) VALUES (?, ?, ?, ?, ?)')
            .run(currentUser || 'Sistema', 'DELETE', `Tarefa excluída: ${task.action}`, 'Tarefas', task.action);
    }
    res.json({ success: true });
});

app.post('/api/tasks/import', (req, res) => {
    const { data, currentUser } = req.body;
    const now = new Date().toLocaleString('pt-BR');
    
    const insert = db.prepare(`
        INSERT INTO tasks (
            id, dateGroup, startDate, endDate, time, action, responsible, 
            agent, observation, status, history, category, sort_order
        ) VALUES (
            @id, @dateGroup, @startDate, @endDate, @time, @action, @responsible, 
            @agent, @observation, @status, @history, @category, @sort_order
        )
    `);

    const last = db.prepare('SELECT MAX(CAST(id AS INTEGER)) as maxId FROM tasks').get();
    let currentId = parseInt(last.maxId || 0);

    const transaction = db.transaction((items) => {
        for (const item of items) {
            currentId++;
            insert.run({
                id: currentId.toString(),
                dateGroup: item['Data Início'] || '',
                startDate: item['Data Início'] || '',
                endDate: item['Data Fim'] || '',
                time: item['Horário'] || '',
                action: item['Atividade'] || '',
                responsible: item['Responsável'] || '',
                agent: item['Agente'] || '',
                observation: item['Observações'] || '',
                status: item['Status'] || 'Pendente',
                history: `[${now}] Importado via planilha por ${currentUser || 'Sistema'}.`,
                category: item['Categoria/Escopo'] || 'OUTROS',
                sort_order: currentId
            });
        }
    });

    try {
        transaction(data);
        res.json({ success: true, count: data.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- AUTOMATED ALERTS CHECK ---
app.get('/api/admin/check-alerts', async (req, res) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingDate = new Date();
    upcomingDate.setDate(now.getDate() + 3);
    upcomingDate.setHours(0, 0, 0, 0);

    const parseDate = (d) => {
        if (!d) return null;
        try {
            const parts = d.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        } catch (e) { return null; }
    };

    const tasks = db.prepare('SELECT * FROM tasks').all();
    let alertsCount = 0;

    for (const task of tasks) {
        if (task.status === 'FINALIZADO') continue;
        const endDate = parseDate(task.endDate);
        if (!endDate) continue;

        let type = '';
        if (endDate < now) type = 'OVERDUE';
        else if (endDate <= upcomingDate) type = 'UPCOMING';

        if (type) {
            const user = db.prepare('SELECT email FROM users WHERE name = ? OR username = ?').get(task.responsible, task.responsible);
            if (user && user.email) {
                const subject = type === 'OVERDUE' ? 'TAREFA ATRASADA!' : 'Tarefa Próxima do Vencimento';
                const message = type === 'OVERDUE' 
                    ? `<p style="color: red; font-size: 20px;"><b>ALERTA DE ATRASO</b></p>`
                    : `<p style="color: orange;"><b>Lembrete de Prazo</b></p>`;
                
                await sendEmail(user.email, `[GESTÃO] ${subject}`, 
                    `${message}
                     <p>A tarefa <b>"${task.action}"</b> está ${type === 'OVERDUE' ? 'ATRASADA' : 'próxima do vencimento (3 dias)'}.</p>
                     <p><b>Prazo:</b> ${task.endDate}</p>
                     <p>Por favor, atualize o status no sistema Mais Corporativo.</p>`);
                alertsCount++;
            }
        }
    }

    res.json({ success: true, totalAlerts: alertsCount });
});

// --- SYSTEM LOGS ---
app.get('/api/logs', (req, res) => {
    const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100').all();
    res.json(logs);
});

app.post('/api/logs', (req, res) => {
    const { user, action, details } = req.body;
    db.prepare('INSERT INTO logs (user, action, details) VALUES (?, ?, ?)').run(user, action, details);
    res.json({ success: true });
});

// Fallback for React SPA Routing - Middleware approach (robust for Express 5)
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        next();
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
