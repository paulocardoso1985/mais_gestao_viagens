const fetch = require('node-fetch');

async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                pin: '1234',
                name: 'Test User',
                role: 'USER',
                email: 'test@example.com'
            })
        });
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
