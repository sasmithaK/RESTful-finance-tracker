const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
    // Test cases for the auth endpoints
    const testCases = [
        {
            description: 'should register a new user',
            endpoint: '/api/auth/register',
            method: 'post',
            payload: { username: 'testuser10', password: 'roottestuser', role: 'user' },
            expectedStatus: 201,
        },
        {
            description: 'should register a new admin',
            endpoint: '/api/auth/register',
            method: 'post',
            payload: { username: 'testadmin01', password: 'adminpass500', role: 'admin' },
            expectedStatus: 201,
        },
        {
            description: 'should login an existing user',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'testuser', password: 'password123' },
            expectedStatus: 200,
        },
        {
            description: 'should login an existing admin',
            endpoint: '/api/auth/login',
            method: 'post',
            payload: { username: 'testadmin01', password: 'adminpass500' },
            expectedStatus: 200,
        }
    ];

    testCases.forEach(({ description, endpoint, method, payload, expectedStatus }) => {
        it(description, async () => {
            const res = await request(app)[method](endpoint).send(payload);
            expect(res.statusCode).toBe(expectedStatus);
            expect(res.body).toHaveProperty('token');
        });
    });
});
