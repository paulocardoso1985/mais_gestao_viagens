import Papa from 'papaparse';

const API_BASE_URL = 'http://localhost:3001/api';

export const UF_COORDS = {
    'AC': [-9.02, -70.52], 'AL': [-9.57, -36.78], 'AP': [1.41, -51.77], 'AM': [-3.41, -65.05],
    'BA': [-12.97, -38.51], 'CE': [-3.71, -38.54], 'DF': [-15.78, -47.93], 'ES': [-19.19, -40.34],
    'GO': [-16.68, -49.25], 'MA': [-2.55, -44.30], 'MT': [-12.64, -55.42], 'MS': [-20.44, -54.64],
    'MG': [-18.51, -44.55], 'PA': [-1.45, -48.50], 'PB': [-7.11, -34.86], 'PR': [-25.25, -52.02],
    'PE': [-8.05, -34.88], 'PI': [-5.09, -42.80], 'RJ': [-22.90, -43.17], 'RN': [-5.79, -35.20],
    'RS': [-30.03, -51.21], 'RO': [-8.76, -63.90], 'RR': [2.82, -60.67], 'SC': [-27.24, -50.21],
    'TO': [-10.16, -48.33], 'SP': [-23.55, -46.63], 'SE': [-10.91, -37.07]
};

export const CITY_COORDS = {
    'ARAGUAÍNA': [-7.1892, -48.2078], 'ARAXÁ': [-19.5933, -46.9405], 'BELÉM': [-1.4558, -48.4902],
    'BELO HORIZONTE': [-19.9167, -43.9345], 'BLUMENAU': [-26.9187, -49.0660], 'BRASÍLIA': [-15.7801, -47.9292],
    'BRUSQUE': [-27.0969, -48.9104], 'CAPÃO DA CANOA': [-29.7588, -50.0476], 'CAXIAS DO SUL': [-29.1678, -51.1794],
    'CERRO LARGO': [-28.1469, -54.7380], 'CHAPECÓ': [-27.1005, -52.6152], 'COLOMBO': [-25.2917, -49.2242],
    'CURITIBA': [-25.4290, -49.2671], 'CURITIBANOS': [-27.2828, -50.5842], 'DOURADINA': [-23.3746, -53.2925],
    'ELDORADO DO SUL': [-30.0837, -51.6095], 'FLORIANÓPOLIS': [-27.5954, -48.5480], 'FORTALEZA': [-3.7172, -38.5434],
    'GOIÂNIA': [-16.6869, -49.2648], 'GUABIRUBA': [-27.0847, -48.9819], 'GURUPI': [-11.7292, -49.0686],
    'IMPERATRIZ': [-5.5264, -47.4917], 'ITAPEMA': [-27.0864, -48.6117], 'JAGUARIÚNA': [-22.7056, -46.9858],
    'JOÃO PESSOA': [-7.1150, -34.8631], 'JOINVILLE': [-26.3045, -48.8456], 'LAJEADO': [-29.4673, -51.9611],
    'LONDRINA': [-23.3106, -51.1628], 'PASSO FUNDO': [-28.2628, -52.4067], 'PORTO ALEGRE': [-30.0346, -51.2177],
    'PRAIA GRANDE': [-24.0051, -46.4024], 'RIBEIRÃO PRETO': [-21.1775, -47.8103], 'RIO DE JANEIRO': [-22.9068, -43.1729],
    'SALVADOR': [-12.9711, -38.5108], 'SÃO LUÍS': [-2.5307, -44.3068], 'SÃO PAULO': [-23.5505, -46.6333],
    'TERESINA': [-5.0892, -42.8019], 'UBERLÂNDIA': [-19.0233, -48.3348], 'VARGINHA': [-21.5514, -45.4303],
    'VILA VELHA': [-20.3297, -40.2925], 'VITÓRIA': [-20.3194, -40.3378]
};

export const getCoords = (city, uf) => {
    if (city) {
        const cleanCity = city.toUpperCase().trim();
        if (CITY_COORDS[cleanCity]) return CITY_COORDS[cleanCity];
    }
    return UF_COORDS[uf] || [-15, -47];
};

export const fetchData = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/participants`);
        const participants = await res.json();

        // Calculate tour statistics
        const tourCounts = { 'City Tour': 0, 'Cavernas Drach': 0, 'Tarde Livre': 0, 'Pendente': 0 };
        participants.forEach(p => {
            const tour = p.tour || 'Pendente';
            if (tourCounts.hasOwnProperty(tour)) tourCounts[tour]++;
            else tourCounts['Pendente']++;
        });

        // Calculate locations
        const cityCounts = {};
        participants.forEach(p => {
            if (!p.city) return;
            const key = `${p.city}|${p.uf}`;
            if (!cityCounts[key]) cityCounts[key] = { Cidade: p.city, UF: p.uf, Qtd: 0 };
            cityCounts[key].Qtd++;
        });
        const locations = Object.values(cityCounts).sort((a, b) => b.Qtd - a.Qtd);

        // Calculate allergy statistics
        const allergyStats = {};
        participants.forEach(p => {
            if (p.allergies) {
                const list = p.allergies.split(',').map(a => a.trim()).filter(Boolean);
                list.forEach(all => {
                    if (!allergyStats[all]) allergyStats[all] = 0;
                    allergyStats[all]++;
                });
            }
        });

        return {
            participants,
            locations,
            summary: {
                totalDisparos: 112,
                respondidos: participants.length, // approximation
                totalPessoas: participants.length,
                titulares: participants.filter(p => p.type === 'Titular').length,
                acompanhantes: participants.filter(p => p.type === 'Acompanhante').length,
                tours: tourCounts,
                allergyStats: allergyStats
            }
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchManagementData = async () => {
    try {
        const [tasksRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/tasks`),
            fetch(`${API_BASE_URL}/users`)
        ]);

        const tasks = await tasksRes.json();
        const users = await usersRes.json();

        // For backwards compatibility in the UI until it's fully updated
        return { timeline: tasks, checklist: tasks, users };
    } catch (error) {
        console.error('Error fetching management data:', error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/users`);
        return await res.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// --- Remote Persistence (now unified) ---
export const updateTaskRemote = async (taskData, type, currentUser) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks?currentUser=${encodeURIComponent(currentUser)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createTaskRemote = async (taskData, type, currentUser) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks?currentUser=${encodeURIComponent(currentUser)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteTaskRemote = async (task, type, currentUser) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${task.id}?currentUser=${encodeURIComponent(currentUser)}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const moveTaskRemote = async (taskId, direction, type, user) => {
    return { success: true };
};

export const createUserRemote = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserRemote = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteUserRemote = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const checkAlertsRemote = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/check-alerts`);
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const changePINRemote = async (username, newPIN) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pin: newPIN })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const fetchFilesRemote = async () => {
    return [];
};

export const uploadFileRemote = async (fileData) => {
    return { success: true };
};

export const fetchSystemLogsRemote = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/logs`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

const logAction = async (user, action, details) => {
    try {
        await fetch(`${API_BASE_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, action, details })
        });
    } catch (e) {}
};

// --- Import Logic ---
export const importSpreadsheetData = async (data, type, currentUser) => {
    if (type === 'participants') {
        const response = await fetch(`${API_BASE_URL}/participants/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        return await response.json();
    }
    
    if (type === 'tasks') {
        const response = await fetch(`${API_BASE_URL}/tasks/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, currentUser })
        });
        return await response.json();
    }
    
    return { success: false, error: 'Tipo de importação não suportado' };
};
