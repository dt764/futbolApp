const Player = require('../models/Player');
const { searchPlayers } = require('../services/apiFootball');

const list = async (req, res) => {
  try {
    const { name, team, league, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (team) {
      filter.team = { $regex: team, $options: 'i' };
    }
    if (league) {
      filter.league = { $regex: league, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [players, total] = await Promise.all([
      Player.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Player.countDocuments(filter),
    ]);

    res.json({
      players,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
};

const getById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json({ player });
  } catch {
    res.status(500).json({ error: 'Error al obtener el jugador' });
  }
};

const searchExternal = async (req, res) => {
  try {
    const { name, team, league, page } = req.query;
    const data = await searchPlayers({ name, team, league, page });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Error al consultar la API externa de fútbol' });
  }
};

const importFromApi = async (req, res) => {
  try {
    const { player: apiPlayerData, statistics, team, league, location } = req.body;

    if (!apiPlayerData?.id) {
      return res.status(400).json({ error: 'Datos del jugador inválidos. Envía el objeto con player y statistics.' });
    }

    const apiId = apiPlayerData.id;
    const exists = await Player.findOne({ apiId });
    if (exists) {
      return res.status(409).json({ error: 'El jugador ya existe en la base de datos' });
    }

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
    res.status(201).json({ player });
  } catch {
    res.status(500).json({ error: 'Error al importar el jugador' });
  }
};

const create = async (req, res) => {
  try {
    const { name, firstname, lastname, nationality, position, birthDate,
            height, weight, photo, team, league, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del jugador es obligatorio' });
    }

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

    res.status(201).json({ player });
  } catch {
    res.status(500).json({ error: 'Error al crear el jugador' });
  }
};

const update = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json({ player });
  } catch {
    res.status(500).json({ error: 'Error al actualizar el jugador' });
  }
};

const remove = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json({ message: 'Jugador eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar el jugador' });
  }
};

module.exports = { list, getById, searchExternal, importFromApi, create, update, remove };
