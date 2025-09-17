const request = require('supertest');
const app = require('../app');

describe('Auth', () => {
  const email = `test${Date.now()}@example.com`;
  const password = 'Password123!';

  test('register -> 201', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(email);
  });

  test('register duplicate -> 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password });
    expect(res.status).toBe(409);
  });

  test('login ok -> 200 + token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(email);
  });

  test('login wrong password -> 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
