const request = require('supertest');
const app = require('../app');

describe('Contacts', () => {
  let token;

  beforeAll(async () => {
    const email = `u${Date.now()}@ex.com`;
    const password = 'Password123!';
    const reg = await request(app).post('/api/auth/register').send({ email, password });
    expect(reg.status).toBe(201);
    token = reg.body.token;
    expect(token).toBeTruthy();
  });

  test('list initially empty', async () => {
    const res = await request(app).get('/api/contacts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('create -> 201, patch -> 200, delete -> 204', async () => {
    const create = await request(app)
      .post('/api/contacts')   // ← ajout de /api
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Ada', lastName: 'Lovelace', phone: '0601020304' });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const patch = await request(app)
      .patch(`/api/contacts/${id}`)  // ← ajout de /api
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '0611111111' });
    expect(patch.status).toBe(200);

    const del = await request(app)
      .delete(`/api/contacts/${id}`) // ← ajout de /api
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
  });

  test('401 when no token', async () => {
    const res = await request(app).get('/api/contacts'); // ← ajout de /api
    expect(res.status).toBe(401);
  });
});
