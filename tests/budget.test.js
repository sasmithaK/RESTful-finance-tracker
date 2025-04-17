const request = require('supertest');
const { connectDB, closeDB } = require('../config/db'); // Ensure this file exports both functions
const app = require('../server'); // Import app instead of running the server
const Budget = require('../models/Budget');
const User = require('../models/User');

describe('Budget API Tests', () => {
    let testUser;
    let authToken;
    let testBudget;

    beforeAll(async () => {
        // Connect to the test database
        await connectDB();

        // Clean up any existing test data
        await Budget.deleteMany({});
        await User.deleteMany({});

        // Create a test user
        const userResponse = await request(app)
            .post('/api/users/register')
            .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

        testUser = userResponse.body;
        
        // Log in the user and get the token
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({ email: 'test@example.com', password: 'password123' });

        authToken = loginResponse.body.token;

        // Create a sample budget
        const budgetResponse = await request(app)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Test Budget',
                amount: 5000,
                spent: 1000,
                period: 'monthly',
                category: 'Groceries',
                startDate: '2025-03-01T00:00:00.000Z',
                endDate: '2025-03-31T23:59:59.999Z',
                notificationThreshold: 75,
                isActive: true
            });

        testBudget = budgetResponse.body;
    });

    afterAll(async () => {
        // Cleanup test data
        await Budget.deleteMany({});
        await User.deleteMany({});

        // Close the database connection
        await closeDB();
    });

    test('Create a Budget', async () => {
        const res = await request(app)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'New Budget',
                amount: 10000,
                spent: 2000,
                period: 'yearly',
                category: 'Utilities',
                startDate: '2025-04-01T00:00:00.000Z',
                endDate: '2026-04-01T23:59:59.999Z',
                notificationThreshold: 80,
                isActive: true
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('New Budget');
        expect(res.body.amount).toBe(10000);
        expect(res.body.spent).toBe(2000);
        expect(res.body.category).toBe('Utilities');
        expect(res.body.period).toBe('yearly');
    });

    test('Fetch All Budgets', async () => {
        const res = await request(app)
            .get('/api/budgets')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('Fetch Single Budget', async () => {
        const res = await request(app)
            .get(`/api/budgets/${testBudget._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', testBudget._id);
        expect(res.body.name).toBe('Test Budget');
    });

    test('Update a Budget', async () => {
        const res = await request(app)
            .put(`/api/budgets/${testBudget._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 8000, spent: 2500 });

        expect(res.statusCode).toBe(200);
        expect(res.body.amount).toBe(8000);
        expect(res.body.spent).toBe(2500);
    });

    test('Delete a Budget', async () => {
        const res = await request(app)
            .delete(`/api/budgets/${testBudget._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });

    test('Get Budget Status', async () => {
        const res = await request(app)
            .get('/api/budgets/status')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('totalBudget');
    });
});
