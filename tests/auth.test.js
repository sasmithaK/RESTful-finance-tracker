const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed

describe('Auth Endpoints', () => {
    const registrationUsers = [
        { 
            username: 'userApple', 
            email: 'apple@test.com',
            password: 'apple3000', 
            role: 'user',
            fullName: 'Apple User'
        },
        { 
            username: 'adminMango', 
            email: 'mango@test.com',
            password: 'mango100', 
            role: 'admin',
            fullName: 'Mango Admin'
        },
    ];

    const loginUsers = [
        { 
            username: 'testuser10', 
            email: 'testuser10@test.com',
            password: 'roottestuser', 
            role: 'user',
            fullName: 'Test User 10'
        },
        { 
            username: 'testadmin01', 
            email: 'testadmin01@test.com',
            password: 'adminpass500', 
            role: 'admin',
            fullName: 'Test Admin 01'
        },
    ];

    beforeAll(async () => {
        await User.deleteMany({});
        
        for (const user of loginUsers) {
            await request(app).post('/api/auth/register').send(user);
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    it('should register a new user and return success message', async () => {
        const res = await request(app).post('/api/auth/register').send(registrationUsers[0]);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully.');
        expect(res.body).toHaveProperty('success', true);
    });

    it('should register a new admin and return success message', async () => {
        const res = await request(app).post('/api/auth/register').send(registrationUsers[1]);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully.');
        expect(res.body).toHaveProperty('success', true);
    });

    it('should login an existing user and return token', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: loginUsers[0].username, 
            password: loginUsers[0].password 
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe(loginUsers[0].username);
    });

    it('should login an existing admin and return token', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: loginUsers[1].username, 
            password: loginUsers[1].password 
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe(loginUsers[1].username);
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: loginUsers[0].username, 
            password: 'wrongpassword' 
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should fail login for non-existent user', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'nonexistentuser', 
            password: 'password123' 
        });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found.');
    });

    it('should fail registration with duplicate username', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: loginUsers[0].username,
            email: 'different@test.com',
            password: 'newpassword',
            fullName: 'Duplicate Test'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should fail registration with missing required fields', async () => {
        const res = await request(app).post('/api/auth/register').send({ username: 'incomplete' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'All fields are required');
    });
});
