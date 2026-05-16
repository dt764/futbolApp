const Player = require('../models/Player');
const { searchPlayers, getPlayerById } = require('../services/apiFootball');

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
    const { apiId, team, league } = req.body;

    const exists = await Player.findOne({ apiId });
    if (exists) {
      return res.status(409).json({ error: 'El jugador ya existe en la base de datos' });
    }

    const data = await getPlayerById(apiId);
    const apiPlayer = data.response?.[0];

    if (!apiPlayer) {
      return res.status(404).json({ error: 'Jugador no encontrado en la API externa' });
    }

    const playerData = {
      source: 'api',
      apiId: apiPlayer.player.id,
      name: apiPlayer.player.name,
      firstname: apiPlayer.player.firstname,
      lastname: apiPlayer.player.lastname,
      nationality: apiPlayer.player.nationality,
      position: apiPlayer.statistics?.[0]?.games?.position,
      birthDate: apiPlayer.player.birth?.date,
      birthPlace: apiPlayer.player.birth?.place,
      birthCountry: apiPlayer.player.birth?.country,
      height: apiPlayer.player.height,
      weight: apiPlayer.player.weight,
      photo: apiPlayer.player.photo,
      team: team || apiPlayer.statistics?.[0]?.team?.name,
      league: league || apiPlayer.statistics?.[0]?.league?.name,
      location: req.body.location || { lat: 0, lng: 0 },
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
