const request = require("supertest");

const server = require("../api/server");
const db = require("../database/dbConfig.js");

const restricted = require('./authenticate-middleware');

describe('auth testing', ()=>{
    beforeEach(async () => {
        await db("users").truncate();
    });

    describe('POST /api/register',()=>{
        it("should have 201 status", async()=>{
            const res = await request(server).post('/api/auth/register').send({"username": "test","password": "pass"})

            expect(res.status).toBe(201);
        })
        it("should return lenth of 1", async()=>{
            await request(server).post('/api/auth/register').send({"username": "test","password": "pass"})

            const users = await db("users");

            expect(users).toHaveLength(1)
        })
    })

    describe('POST /api/login',()=>{
        it("should have 201 status", async()=>{
            await request(server).post('/api/auth/register').send({"username": "test","password": "pass"})

            const res = await request(server).post('/api/auth/login').send({"username": "test","password": "pass"})

            expect(res.status).toBe(200);
        })
        it("should return a token", async()=>{
            await request(server).post('/api/auth/register').send({"username": "test","password": "pass"})

            const res = await request(server).post('/api/auth/login').send({"username": "test","password": "pass"})

            expect(res.body.token).toBeDefined()
        })
    })
})

describe("middleware testing",()=>{
    describe('restricted',()=>{
        it('should not permit access',async()=>{
            const res = await request(server).get('/api/jokes')

            expect(res.status).toBe(401);

        })
        it('should permit access',async()=>{
            await request(server).post('/api/auth/register').send({"username": "test","password": "pass"})
            const login = await request(server).post('/api/auth/login').send({"username": "test","password": "pass"})
            const token = login.body.token

            const res = await request(server).get('/api/jokes').set('Authorization', token)

            expect(res.status).toBe(200);

        })
    })
})
