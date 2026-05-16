jest.mock('../app_api/config/firebase', () => {
  const mockVerifyIdToken = jest.fn();
  return {
    admin: {},
    getAuth: jest.fn(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
    __mockVerifyIdToken: mockVerifyIdToken,
  };
});

const request = require('supertest');
const app = require('../app');
const { createTestUser } = require('./helpers/auth');
const firebaseMock = require('../app_api/config/firebase');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
  });

  it('debería devolver 400 si falta idToken', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('idToken es requerido');
  });

  it('debería devolver 401 si el token es inválido', async () => {
    firebaseMock.__mockVerifyIdToken.mockRejectedValue(new Error('Token inválido'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'fake-token' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token de Firebase inválido o expirado');
  });

  it('debería crear usuario si no existe y devolverlo', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'new-uid' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'valid-token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.uid).toBe('new-uid');
    expect(res.body.user.role).toBe('user');
  });

  it('debería devolver el usuario existente sin duplicarlo', async () => {
    await createTestUser({ uid: 'existing-uid', role: 'admin' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'existing-uid' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: 'valid-token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.uid).toBe('existing-uid');
    expect(res.body.user.role).toBe('admin');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
  });

  it('debería devolver 401 sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('debería devolver el usuario autenticado', async () => {
    await createTestUser({ uid: 'test-uid', displayName: 'Test User' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.statusCode).toBe(200);
    expect(res.body.user.displayName).toBe('Test User');
  });
});
