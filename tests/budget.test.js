const request = require('supertest');
const app = require('../server');

describe('Budget API', () => {
    let token;
    let budgetId;

    const testBudget = { name: 'Test Budget', amount: 1500 };
    const updatedBudget = { name: 'Updated Budget', amount: 2000 };

    // Log in and get a token
    beforeAll(async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'testuser10',
            password: 'roottestuser'
        });
        token = res.body.token;
    });

    const testCases = [
        {
            description: 'should create a new budget',
            endpoint: '/api/budgets',
            method: 'post',
            payload: testBudget,
            expectedStatus: 201,
            afterTest: (res) => { budgetId = res.body.data._id; } // Store created budget ID to perform the tests below
        },
        {
            description: 'should get all budgets',
            endpoint: '/api/budgets',
            method: 'get',
            expectedStatus: 200,
        },
        {
            description: 'should update an existing budget',
            endpoint: () => `/api/budgets/${budgetId}`,
            method: 'put',
            payload: updatedBudget,
            expectedStatus: 200,
        },
        {
            description: 'should delete an existing budget',
            endpoint: () => `/api/budgets/${budgetId}`,
            method: 'delete',
            expectedStatus: 200,
        },
        {
            description: 'should return 404 for non-existing budget',
            endpoint: '/api/budgets/invalidbudgetid',
            method: 'put',
            payload: updatedBudget,
            expectedStatus: 404,
        }
    ];

    testCases.forEach(({ description, endpoint, method, payload, expectedStatus, afterTest }) => {
        it(description, async () => {
            const res = await request(app)[method](typeof endpoint === 'function' ? endpoint() : endpoint)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.statusCode).toBe(expectedStatus);

            if (expectedStatus === 201 || expectedStatus === 200) {
                expect(res.body).toHaveProperty('success', true);
                expect(res.body).toHaveProperty('data');
                if (afterTest) afterTest(res);
            } else {
                expect(res.body).toHaveProperty('success', false);
                expect(res.body).toHaveProperty('error');
            }
        });
    });
});
