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

jest.mock('../app_api/services/groq', () => {
  const mockGenerate = jest.fn();
  return {
    IdealTeamService: jest.fn(() => ({
      generateIdealTeam: mockGenerate,
    })),
    createIdealTeamService: jest.fn(() => ({
      generateIdealTeam: mockGenerate,
    })),
    __mockGenerate: mockGenerate,
  };
});

const request = require('supertest');
const app = require('../app');
const Player = require('../app_api/models/Player');
const User = require('../app_api/models/User');
const firebaseMock = require('../app_api/config/firebase');
const groqMock = require('../app_api/services/groq');

const asUser = (token = 'valid-token') => `Bearer ${token}`;

const createApiPlayer = async (overrides = {}) => {
  return Player.create({
    source: 'api',
    apiId: Math.floor(Math.random() * 10000),
    name: 'Test Player',
    firstname: 'Test',
    lastname: 'Player',
    nationality: 'Spain',
    position: 'Forward',
    team: 'Test FC',
    league: 'Test League',
    location: { lat: 0, lng: 0 },
    createdBy: 'test-uid',
    ...overrides,
  });
};

beforeEach(async () => {
  await User.deleteMany();
  await Player.deleteMany();
  firebaseMock.__mockVerifyIdToken.mockReset();
  groqMock.__mockGenerate.mockReset();
});

describe('POST /api/ideal-team', () => {
  it('debería devolver 401 sin autenticación', async () => {
    const res = await request(app)
      .post('/api/ideal-team')
      .send({ formation: '4-3-3' });

    expect(res.statusCode).toBe(401);
  });

  it('debería devolver 400 si hay menos de 11 jugadores', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    await createApiPlayer({ name: 'Solo uno' });

    const res = await request(app)
      .post('/api/ideal-team')
      .set('Authorization', asUser())
      .send({ formation: '4-3-3' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('11 jugadores');
  });

  it('debería generar equipo ideal con 11+ jugadores', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    for (let i = 0; i < 11; i++) {
      await createApiPlayer({ name: `Jugador ${i + 1}` });
    }

    groqMock.__mockGenerate.mockResolvedValue({
      formation: '4-3-3',
      startingXI: [
        { name: 'Jugador 1', position: 'Portero', reason: 'experiencia' },
      ],
      substitutes: [{ name: 'Jugador 11', position: 'Delantero', reason: 'rapidez' }],
      coach: 'Entrenador X',
      summary: 'Equipo equilibrado',
    });

    const res = await request(app)
      .post('/api/ideal-team')
      .set('Authorization', asUser())
      .send({ formation: '4-3-3' });

    expect(res.statusCode).toBe(200);
    expect(res.body.team.formation).toBe('4-3-3');
    expect(res.body.team.startingXI).toHaveLength(1);
    expect(res.body.team.coach).toBe('Entrenador X');
  });

  it('debería ignorar jugadores manuales (source: manual)', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    await Player.create({
      source: 'manual',
      name: 'Jugador Inventado',
      location: { lat: 0, lng: 0 },
      createdBy: 'test-uid',
    });

    const res = await request(app)
      .post('/api/ideal-team')
      .set('Authorization', asUser())
      .send({ formation: '4-3-3' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('11 jugadores');
  });

  it('debería funcionar sin formación (que Groq elija)', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    for (let i = 0; i < 11; i++) {
      await createApiPlayer({ name: `Jugador ${i + 1}` });
    }

    groqMock.__mockGenerate.mockResolvedValue({
      formation: '3-5-2',
      startingXI: [],
      substitutes: [],
      coach: 'Entrenador Y',
      summary: 'Equipo ofensivo',
    });

    const res = await request(app)
      .post('/api/ideal-team')
      .set('Authorization', asUser())
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.team.formation).toBe('3-5-2');
  });

  it('debería generar equipo fantasy sin BD', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    groqMock.__mockGenerate.mockResolvedValue({
      formation: '4-4-2',
      startingXI: [{ name: 'Messi', position: 'Delantero', reason: 'genio' }],
      substitutes: [],
      coach: 'Guardiola',
      summary: 'Equipo de ensueño',
    });

    const res = await request(app)
      .post('/api/ideal-team')
      .set('Authorization', asUser())
      .send({ source: 'fantasy', formation: '4-4-2' });

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe('fantasy');
    expect(res.body.team.formation).toBe('4-4-2');
  });
});
