const Database = require('./database.cjs');
const crypto = require('crypto');

const db = Database;

const firstNames = ['ADRIANA', 'ALEXSANDRA', 'ANA', 'ANDRESSA', 'BEATRIZ', 'BRUNA', 'CAMILA', 'CRISTIANE', 'DANIELA', 'DEBORA', 'ELIANA', 'FERNANDA', 'FLAVIA', 'GABRIELA', 'HELOISA', 'ISABELA', 'JESSICA', 'JULIANA', 'LARISSA', 'LETICIA', 'LUANA', 'MARCELA', 'MARIA', 'NATALIA', 'PATRICIA', 'PAULA', 'RAFAELA', 'RENATA', 'ROBERTA', 'SABRINA', 'TATIANE', 'VANESSA', 'VITÓRIA'];
const lastNames = ['SILVA', 'SANTOS', 'OLIVEIRA', 'SOUZA', 'RODRIGUES', 'FERREIRA', 'ALVES', 'PEREIRA', 'LIMA', 'GOMES', 'COSTA', 'RIBEIRO', 'MARTINS', 'CARVALHO', 'ALMEIDA', 'LOPES', 'SOARES', 'FERNANDES', 'VIEIRA', 'BARBOSA', 'ROCHA', 'DIAS', 'NASCIMENTO', 'ANDRADE', 'MOREIRA', 'NUNES', 'MARQUES', 'MACHADO', 'MENDES', 'FREITAS', 'CARDOSO', 'RAMOS', 'TEIXEIRA'];
const maleFirstNames = ['ALEXANDRE', 'ANDRÉ', 'ANTONIO', 'BRUNO', 'CARLOS', 'DANIEL', 'DIEGO', 'EDUARDO', 'FELIPE', 'FERNANDO', 'GABRIEL', 'GUSTAVO', 'HENRIQUE', 'IGOR', 'JOÃO', 'JOSÉ', 'LEANDRO', 'LUCAS', 'LUIZ', 'MARCELO', 'MARCOS', 'MATHEUS', 'PAULO', 'PEDRO', 'RAFAEL', 'RICARDO', 'RODRIGO', 'SAMUEL', 'THIAGO', 'TIAGO', 'VINICIUS', 'VITOR'];

const cities = [
    { city: 'SÃO PAULO', uf: 'SP', airport: 'GRU' },
    { city: 'RIO DE JANEIRO', uf: 'RJ', airport: 'GIG' },
    { city: 'CURITIBA', uf: 'PR', airport: 'CWB' },
    { city: 'BELO HORIZONTE', uf: 'MG', airport: 'CNF' },
    { city: 'PORTO ALEGRE', uf: 'RS', airport: 'POA' },
    { city: 'SALVADOR', uf: 'BA', airport: 'SSA' },
    { city: 'FORTALEZA', uf: 'CE', airport: 'FOR' },
    { city: 'BRASÍLIA', uf: 'DF', airport: 'BSB' },
    { city: 'FLORIANÓPOLIS', uf: 'SC', airport: 'FLN' },
    { city: 'GOIÂNIA', uf: 'GO', airport: 'GYN' },
    { city: 'MANAUS', uf: 'AM', airport: 'MAO' },
    { city: 'RECIFE', uf: 'PE', airport: 'REC' }
];

const tours = ['City Tour', 'Cavernas Drach', 'Tarde Livre'];
const nationalities = ['BRASILEIRA', 'PORTUGUESA', 'ITALIANA'];
const relationships = ['CÔNJUGE', 'FILHO(A)', 'IRMÃO(A)', 'AMIGO(A)', 'PAI/MÃE'];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateCPF() {
    return Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
}

function generatePassport() {
    return 'G' + (Math.floor(Math.random() * 800000) + 100000).toString();
}

function generatePhone() {
    return '11' + (Math.floor(Math.random() * 80000000) + 10000000).toString();
}

function generateBirthday() {
    const year = Math.floor(Math.random() * 40) + 1970;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${day}/${month}/${year}`;
}

const participants = [];
const numTitulars = 115;

for (let i = 0; i < numTitulars; i++) {
    const isMale = Math.random() > 0.5;
    const first = isMale ? getRandom(maleFirstNames) : getRandom(firstNames);
    const last = getRandom(lastNames) + ' ' + getRandom(lastNames);
    const name = `${first} ${last}`;
    const cityObj = getRandom(cities);
    const email = `${first.toLowerCase()}.${last.split(' ')[0].toLowerCase()}@demo.com`;
    const passport = generatePassport();
    
    const titularId = crypto.randomUUID();
    const titular = {
        id: titularId,
        type: 'Titular',
        name: name,
        email: email,
        phone: generatePhone(),
        cpf: generateCPF(),
        birthday: generateBirthday(),
        gender: isMale ? 'Masculino' : 'Feminino',
        nationality: getRandom(nationalities),
        passport: passport,
        passportIssueDate: '10/05/2023',
        passportExpiryDate: '10/05/2033',
        passportPhoto: 'passport_demo.jpg',
        usVisa: Math.random() > 0.7 ? 'Sim' : 'Não',
        usVisaExpiry: '20/12/2028',
        city: cityObj.city,
        uf: cityObj.uf,
        airport: cityObj.airport,
        tour: getRandom(tours),
        allergies: Math.random() > 0.8 ? 'Glúten' : '',
        restrictions: Math.random() > 0.9 ? 'Vegetariano' : '',
        medicalConditions: '',
        mobilityAssistance: 'Não',
        mobilityDetails: '',
        emergencyName: 'CONTATO DE EMERGENCIA',
        emergencyRelationship: getRandom(relationships),
        emergencyPhone: generatePhone(),
        titularName: '',
        status: 'Confirmado'
    };
    participants.push(titular);

    // 90% chance of having a companion
    if (Math.random() > 0.1) {
        const cIsMale = Math.random() > 0.5;
        const cFirst = cIsMale ? getRandom(maleFirstNames) : getRandom(firstNames);
        const cLast = last.split(' ')[0] + ' ' + getRandom(lastNames);
        const cName = `${cFirst} ${cLast}`;
        
        const companion = {
            id: crypto.randomUUID(),
            type: 'Acompanhante',
            name: cName,
            email: `${cFirst.toLowerCase()}@demo.com`,
            phone: generatePhone(),
            cpf: generateCPF(),
            birthday: generateBirthday(),
            gender: cIsMale ? 'Masculino' : 'Feminino',
            nationality: getRandom(nationalities),
            passport: generatePassport(),
            passportIssueDate: '15/06/2022',
            passportExpiryDate: '15/06/2032',
            passportPhoto: 'passport_demo_comp.jpg',
            usVisa: Math.random() > 0.8 ? 'Sim' : 'Não',
            usVisaExpiry: '15/03/2027',
            city: cityObj.city,
            uf: cityObj.uf,
            airport: cityObj.airport,
            tour: getRandom(tours),
            allergies: '',
            restrictions: titular.restrictions,
            medicalConditions: '',
            mobilityAssistance: 'Não',
            mobilityDetails: '',
            emergencyName: name,
            emergencyRelationship: titular.emergencyRelationship,
            emergencyPhone: titular.phone,
            titularName: name,
            status: 'Confirmado'
        };
        participants.push(companion);
    }
}

const insert = db.prepare(`
    INSERT INTO participants (
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

db.transaction(() => {
    db.prepare('DELETE FROM participants').run();
    for (const p of participants) {
        insert.run(p);
    }
})();

console.log(`Successfully seeded ${participants.length} demo participants.`);
process.exit(0);
