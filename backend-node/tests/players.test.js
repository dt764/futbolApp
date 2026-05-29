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

jest.mock('../app_api/services/apiFootball');

const request = require('supertest');
const app = require('../app');
const Player = require('../app_api/models/Player');
const User = require('../app_api/models/User');
const { createTestUser } = require('./helpers/auth');
const firebaseMock = require('../app_api/config/firebase');
const apiFootball = require('../app_api/services/apiFootball');

const asUser = (token = 'valid-token') => `Bearer ${token}`;
const asAdmin = (token = 'admin-token') => `Bearer ${token}`;

beforeEach(async () => {
  await User.deleteMany();
  await Player.deleteMany();
});

describe('GET /api/players', () => {
  beforeEach(async () => {
    await Player.deleteMany();
  });

  it('debería listar jugadores vacío', async () => {
    const res = await request(app).get('/api/players');

    expect(res.statusCode).toBe(200);
    expect(res.body.players).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('debería listar jugadores existentes', async () => {
    await Player.create({
      source: 'manual', name: 'Messi', team: 'Inter Miami',
      location: { lat: 0, lng: 0 }, createdBy: 'x',
    });
    await Player.create({
      source: 'manual', name: 'Ronaldo', team: 'Al Nassr',
      location: { lat: 0, lng: 0 }, createdBy: 'x',
    });

    const res = await request(app).get('/api/players');

    expect(res.statusCode).toBe(200);
    expect(res.body.players).toHaveLength(2);
  });

  it('debería filtrar por nombre', async () => {
    await Player.create({
      source: 'manual', name: 'Lionel Messi', team: 'Inter Miami',
      location: { lat: 0, lng: 0 }, createdBy: 'x',
    });
    await Player.create({
      source: 'manual', name: 'Cristiano Ronaldo', team: 'Al Nassr',
      location: { lat: 0, lng: 0 }, createdBy: 'x',
    });

    const res = await request(app).get('/api/players?name=messi');

    expect(res.statusCode).toBe(200);
    expect(res.body.players).toHaveLength(1);
    expect(res.body.players[0].name).toBe('Lionel Messi');
  });
});

describe('GET /api/players/:id', () => {
  it('debería devolver 404 si no existe', async () => {
    const res = await request(app).get('/api/players/000000000000000000000000');

    expect(res.statusCode).toBe(404);
  });

  it('debería devolver el jugador por id', async () => {
    const player = await Player.create({
      source: 'manual', name: 'Messi',
      location: { lat: 0, lng: 0 }, createdBy: 'x',
    });

    const res = await request(app).get(`/api/players/${player._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.player.name).toBe('Messi');
  });
});

describe('POST /api/players/manual', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
  });

  it('debería devolver 401 sin token', async () => {
    const res = await request(app)
      .post('/api/players/manual')
      .send({ name: 'Messi' });

    expect(res.statusCode).toBe(401);
  });

  it('debería devolver 400 si falta name', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    const res = await request(app)
      .post('/api/players/manual')
      .set('Authorization', asUser())
      .send({ team: 'Inter Miami' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre del jugador es obligatorio');
  });

  it('debería crear un jugador correctamente', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    const res = await request(app)
      .post('/api/players/manual')
      .set('Authorization', asUser())
      .send({
        name: 'Lionel Messi',
        team: 'Inter Miami',
        league: 'MLS',
        nationality: 'Argentina',
        photo: 'https://example.com/messi.jpg',
        location: { lat: 25.76, lng: -80.19 },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.player.name).toBe('Lionel Messi');
    expect(res.body.player.team).toBe('Inter Miami');
    expect(res.body.player.source).toBe('manual');
    expect(res.body.player.location.lat).toBe(25.76);
  });
});

describe('PUT /api/players/:id', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
  });

  it('debería devolver 403 sin rol admin', async () => {
    await createTestUser({ uid: 'user-uid', role: 'user' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'user-uid' });

    const player = await Player.create({
      source: 'manual', name: 'Messi',
      location: { lat: 0, lng: 0 }, createdBy: 'user-uid',
    });

    const res = await request(app)
      .put(`/api/players/${player._id}`)
      .set('Authorization', asUser('user-token'))
      .send({ name: 'Messi Editado' });

    expect(res.statusCode).toBe(403);
  });

  it('debería actualizar correctamente como admin', async () => {
    await createTestUser({ uid: 'admin-uid', role: 'admin' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'admin-uid' });

    const player = await Player.create({
      source: 'manual', name: 'Messi',
      location: { lat: 0, lng: 0 }, createdBy: 'admin-uid',
    });

    const res = await request(app)
      .put(`/api/players/${player._id}`)
      .set('Authorization', asAdmin('admin-token'))
      .send({ name: 'Messi Editado', team: 'Barcelona' });

    expect(res.statusCode).toBe(200);
    expect(res.body.player.name).toBe('Messi Editado');
    expect(res.body.player.team).toBe('Barcelona');
  });
});

describe('DELETE /api/players/:id', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
  });

  it('debería eliminar correctamente como admin', async () => {
    await createTestUser({ uid: 'admin-uid', role: 'admin' });
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'admin-uid' });

    const player = await Player.create({
      source: 'manual', name: 'Messi',
      location: { lat: 0, lng: 0 }, createdBy: 'admin-uid',
    });

    const res = await request(app)
      .delete(`/api/players/${player._id}`)
      .set('Authorization', asAdmin('admin-token'));

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Jugador eliminado correctamente');

    const exists = await Player.findById(player._id);
    expect(exists).toBeNull();
  });
});

describe('GET /api/players/search/external', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
    apiFootball.__resetMocks();
  });

  it('debería devolver 401 sin token', async () => {
    const res = await request(app).get('/api/players/search/external?name=Messi');

    expect(res.statusCode).toBe(401);
  });

  it('debería buscar en API externa con token', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });
    apiFootball.searchPlayers.mockResolvedValue({
      response: [{ player: { id: 1, name: 'Messi' } }],
    });

    const res = await request(app)
      .get('/api/players/search/external?name=Messi')
      .set('Authorization', asUser());

    expect(res.statusCode).toBe(200);
    expect(apiFootball.searchPlayers).toHaveBeenCalledWith({
      name: 'Messi', team: undefined, league: undefined, page: undefined,
    });
  });
});

describe('POST /api/players/import', () => {
  beforeEach(() => {
    firebaseMock.__mockVerifyIdToken.mockReset();
    apiFootball.__resetMocks();
    Player.deleteMany();
  });

  const mockPlayerData = {
    id: 154, name: 'Lionel Messi', firstname: 'Lionel', lastname: 'Messi',
    nationality: 'Argentina', height: '170 cm', weight: '72 kg',
    photo: 'https://example.com/messi.png',
    birth: { date: '1987-06-24', place: 'Rosario', country: 'Argentina' },
  };

  const mockStatistics = [{
    games: { position: 'Forward' },
    team: { name: 'Inter Miami' },
    league: { name: 'MLS' },
  }];

  it('debería importar un jugador desde API externa', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    const res = await request(app)
      .post('/api/players/import')
      .set('Authorization', asUser())
      .send({ player: mockPlayerData, statistics: mockStatistics, team: 'Inter Miami', league: 'MLS' });

    expect(res.statusCode).toBe(201);
    expect(res.body.player.name).toBe('Lionel Messi');
    expect(res.body.player.apiId).toBe(154);
    expect(res.body.player.source).toBe('api');
  });

  it('debería devolver 400 si faltan datos del jugador', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    const res = await request(app)
      .post('/api/players/import')
      .set('Authorization', asUser())
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('debería devolver 409 si ya existe', async () => {
    firebaseMock.__mockVerifyIdToken.mockResolvedValue({ uid: 'test-uid' });

    await Player.create({
      source: 'api', apiId: 154, name: 'Messi',
      location: { lat: 0, lng: 0 }, createdBy: 'test-uid',
    });

    const res = await request(app)
      .post('/api/players/import')
      .set('Authorization', asUser())
      .send({ player: mockPlayerData, statistics: mockStatistics });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('El jugador ya existe en la base de datos');
  });
});
