const request = require('supertest');
const app = require('../server');

// Test cases for the authentication endpoints
describe('Auth Endpoints', () => {
    let testUsers = [
        { username: 'testuser10', password: 'roottestuser', role: 'user' },
        { username: 'testadmin01', password: 'adminpass500', role: 'admin' },
    ];

    // Ensure test users exist before login tests
    beforeAll(async () => {
        for (const user of testUsers) {
            await request(app).post('/api/auth/register').send(user);
        }
    });


    const testCases = [
        {
            description: 'should register a new user',
            endpoint: '/api/auth/register',
            method: 'post',
            payload: testUsers[0],
            expectedStatus: 201,
        },
        {
            description: 'should register a new admin',
            endpoint: '/api/auth/register',
            method: 'post',
            payload: testUsers[1],
            expectedStatus: 201,
        },
        {
            description: 'should login an existing user',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'testuser10', password: 'roottestuser' },
            expectedStatus: 200,
        },
        {
            description: 'should login an existing admin',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'testadmin01', password: 'adminpass500' },
            expectedStatus: 200,
        },
        {
            description: 'should fail login with wrong password',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'testuser10', password: 'wrongpassword' },
            expectedStatus: 401,
        },
        {
            description: 'should fail login for non-existent user',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'itsme', password: 'password123' },
            expectedStatus: 404,
        }
    ];

    testCases.forEach(({ description, endpoint, method, payload, expectedStatus }) => {
        it(description, async () => {
            const res = await request(app)[method](endpoint).send(payload);
            expect(res.statusCode).toBe(expectedStatus);
            
            if (expectedStatus === 200 || expectedStatus === 201) {
                expect(res.body).toHaveProperty('token');
                expect(res.body).toHaveProperty('user');
            } else {
                // Get error response for failed cases
                expect(res.body).toHaveProperty('error'); 
            }
        });
    });
});
