const request = require('supertest');
const app = require('../server');

describe('Transaction API', () => {
    let token;
    let transactionId;

    const testTransaction = { text: 'Test Transaction', amount: 500 };
    const updatedTransaction = { text: 'Updated Transaction', amount: 700 };

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
            description: 'should create a new transaction',
            endpoint: '/api/transactions',
            method: 'post',
            payload: testTransaction,
            expectedStatus: 201,
            afterTest: (res) => { transactionId = res.body.data._id; } // store created transaction ID to perform the tests below
        },
        {
            description: 'should get all transactions',
            endpoint: '/api/transactions',
            method: 'get',
            expectedStatus: 200,
        },
        {
            description: 'should update an existing transaction',
            endpoint: () => `/api/transactions/${transactionId}`,
            method: 'put',
            payload: updatedTransaction,
            expectedStatus: 200,
        },
        {
            description: 'should delete an existing transaction',
            endpoint: () => `/api/transactions/${transactionId}`,
            method: 'delete',
            expectedStatus: 200,
        },
        {
            description: 'should return 404 for non-existing transaction',
            endpoint: '/api/transactions/invalidtransactionid',
            method: 'put',
            payload: updatedTransaction,
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