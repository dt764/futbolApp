const Player = require('../models/Player');
const { searchPlayers } = require('../services/apiFootball');
const logger = require('../utils/logger');

const list = async (req, res) => {
  try {
    const { name, team, league, createdBy, createdFrom, createdTo, page = 1, limit = 20 } = req.query;

    logger.info('List players', { name, team, league, createdBy, page, limit });

    const filter = {};

    if (name) {
      filter.$or = [
        { name: { $regex: name, $options: 'i' } },
        { firstname: { $regex: name, $options: 'i' } },
        { lastname: { $regex: name, $options: 'i' } },
      ];
    }
    if (team) {
      filter.team = { $regex: team, $options: 'i' };
    }
    if (league) {
      filter.league = { $regex: league, $options: 'i' };
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) filter.createdAt.$lte = new Date(createdTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [players, total] = await Promise.all([
      Player.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Player.countDocuments(filter),
    ]);

    logger.info('List players result', { total, returned: players.length });

    res.json({
      players,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('Error al obtener jugadores', err.message);
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
};

const getById = async (req, res) => {
  try {
    logger.info('Get player by id', { id: req.params.id });

    const player = await Player.findById(req.params.id);
    if (!player) {
      logger.warn('Player not found', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json({ player });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('Invalid player id format', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    logger.error('Error al obtener el jugador', { id: req.params.id, error: err.message });
    res.status(500).json({ error: 'Error al obtener el jugador' });
  }
};

const searchExternal = async (req, res) => {
  try {
    const { name, team, league, page } = req.query;
    logger.info('Search external players API', { name, team, league, page });

    const data = await searchPlayers({ name, team, league, page });
    res.json(data);
  } catch (err) {
    logger.error('Error al consultar API externa', err.message);
    res.status(502).json({ error: 'Error al consultar la API externa de fútbol' });
  }
};

const importFromApi = async (req, res) => {
  try {
    const { player: apiPlayerData, statistics, team, league, location } = req.body;

    if (!apiPlayerData?.id) {
      logger.warn('Import player — invalid data', { body: req.body });
      return res.status(400).json({ error: 'Datos del jugador inválidos. Envía el objeto con player y statistics.' });
    }

    const apiId = apiPlayerData.id;
    const exists = await Player.findOne({ apiId });
    if (exists) {
      logger.warn('Import player — already exists', { apiId, name: apiPlayerData.name });
      return res.status(409).json({ error: 'El jugador ya existe en la base de datos' });
    }

    logger.info('Importing player from API', { apiId, name: apiPlayerData.name, team, league });

    const playerData = {
      source: 'api',
      apiId,
      name: apiPlayerData.name,
      firstname: apiPlayerData.firstname,
      lastname: apiPlayerData.lastname,
      nationality: apiPlayerData.nationality,
      position: statistics?.[0]?.games?.position,
      birthDate: apiPlayerData.birth?.date,
      birthPlace: apiPlayerData.birth?.place,
      birthCountry: apiPlayerData.birth?.country,
      height: apiPlayerData.height,
      weight: apiPlayerData.weight,
      photo: apiPlayerData.photo,
      team: team || statistics?.[0]?.team?.name,
      league: league || statistics?.[0]?.league?.name,
      location: location || { lat: 0, lng: 0 },
      createdBy: req.firebaseUid,
    };

    const player = await Player.create(playerData);
    logger.info('Player imported successfully', { apiId, playerId: player._id });
    res.status(201).json({ player });
  } catch (err) {
    logger.error('Error al importar el jugador', err.message);
    res.status(500).json({ error: 'Error al importar el jugador' });
  }
};

const create = async (req, res) => {
  try {
    const { name, firstname, lastname, nationality, position, birthDate,
            height, weight, photo, team, league, location } = req.body;

    if (!name) {
      logger.warn('Create player — name missing');
      return res.status(400).json({ error: 'El nombre del jugador es obligatorio' });
    }

    logger.info('Creating player', { name, team, league, position });

    const player = await Player.create({
      source: 'manual',
      name,
      firstname,
      lastname,
      nationality,
      position,
      birthDate,
      height,
      weight,
      photo,
      team,
      league,
      location: location || { lat: 0, lng: 0 },
      createdBy: req.firebaseUid,
    });

    logger.info('Player created', { playerId: player._id, name });
    res.status(201).json({ player });
  } catch (err) {
    logger.error('Error al crear el jugador', err.message);
    res.status(500).json({ error: 'Error al crear el jugador' });
  }
};

const update = async (req, res) => {
  try {
    logger.info('Update player', { id: req.params.id });

    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!player) {
      logger.warn('Update player — not found', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    logger.info('Player updated', { id: player._id });
    res.json({ player });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('Update player — invalid id', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    logger.error('Error al actualizar el jugador', { id: req.params.id, error: err.message });
    res.status(500).json({ error: 'Error al actualizar el jugador' });
  }
};

const remove = async (req, res) => {
  try {
    logger.info('Remove player', { id: req.params.id });

    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      logger.warn('Remove player — not found', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    logger.info('Player removed', { id: req.params.id });
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('Remove player — invalid id', { id: req.params.id });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    logger.error('Error al eliminar el jugador', { id: req.params.id, error: err.message });
    res.status(500).json({ error: 'Error al eliminar el jugador' });
  }
};

module.exports = { list, getById, searchExternal, importFromApi, create, update, remove };
