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
const Player = require('../app_api/models/Player');
const Comment = require('../app_api/models/Comment');
const User = require('../app_api/models/User');
const { createTestUser } = require('./helpers/auth');
const firebaseMock = require('../app_api/config/firebase');

let player;

beforeEach(async () => {
  await User.deleteMany();
  await Player.deleteMany();
  await Comment.deleteMany();

  player = await Player.create({
    source: 'manual', name: 'Messi',
    location: { lat: 0, lng: 0 }, createdBy: 'x',
  });
});

describe('GET /api/comments/player/:playerId', () => {
  it('debería listar comentarios de un jugador', async () => {
    await Comment.create({
      player: player._id, author: 'Juan', text: 'Gran jugador', rating: 5,
      location: { lat: 0, lng: 0 },
    });

    const res = await request(app).get(`/api/comments/player/${player._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].author).toBe('Juan');
  });
});

describe('POST /api/comments/player/:playerId', () => {
  it('debería crear un comentario', async () => {
    const res = await request(app)
      .post(`/api/comments/player/${player._id}`)
      .send({ author: 'Pedro', text: 'Muy buen jugador', rating: 4 });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment.author).toBe('Pedro');
    expect(res.body.comment.rating).toBe(4);
  });

  it('debería devolver 400 si falta author', async () => {
    const res = await request(app)
      .post(`/api/comments/player/${player._id}`)
      .send({ text: 'Bueno', rating: 3 });

    expect(res.statusCode).toBe(400);
  });

  it('debería devolver 400 si rating está fuera de rango', async () => {
    const res = await request(app)
      .post(`/api/comments/player/${player._id}`)
      .send({ author: 'Pedro', text: 'Bueno', rating: 6 });

    expect(res.statusCode).toBe(400);
  });

  it('debería devolver 400 si text excede 1000 caracteres', async () => {
    const res = await request(app)
      .post(`/api/comments/player/${player._id}`)
      .send({ author: 'Pedro', text: 'x'.repeat(1001), rating: 3 });

    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/comments/:id', () => {
  it('debería devolver 401 sin token', async () => {
    const comment = await Comment.create({
      player: player._id, author: 'Juan', text: 'Bueno', rating: 3,
      location: { lat: 0, lng: 0 },
    });

    const res = await request(app).delete(`/api/comments/${comment._id}`);

    expect(res.statusCode).toBe(401);
  });

  it('debería devolver 403 si no es admin', async () => {
    await createTestUser({ uid: 'user-uid', role: 'user' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'user-uid' });

    const comment = await Comment.create({
      player: player._id, author: 'Juan', text: 'Bueno', rating: 3,
      location: { lat: 0, lng: 0 },
    });

    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set('Authorization', 'Bearer token');

    expect(res.statusCode).toBe(403);
  });

  it('debería eliminar como admin', async () => {
    await createTestUser({ uid: 'admin-uid', role: 'admin' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'admin-uid' });

    const comment = await Comment.create({
      player: player._id, author: 'Juan', text: 'Bueno', rating: 3,
      location: { lat: 0, lng: 0 },
    });

    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set('Authorization', 'Bearer admin-token');

    expect(res.statusCode).toBe(200);

    const exists = await Comment.findById(comment._id);
    expect(exists).toBeNull();
  });
});
