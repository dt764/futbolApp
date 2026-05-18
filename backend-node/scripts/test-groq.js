require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { createIdealTeamService } = require('../app_api/services/groq');
const Player = require('../app_api/models/Player');

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const players = await Player.find({ source: 'api' }).lean();

  if (players.length < 11) {
    throw new Error(`Solo hay ${players.length} jugadores en BD. Necesitas al menos 11.`);
  }

  const playersList = players.map(p => ({
    name: p.name,
    position: p.position || 'desconocida',
    team: p.team,
    league: p.league,
    nationality: p.nationality,
    height: p.height,
    weight: p.weight,
  }));

  console.log(`Usando ${playersList.length} jugadores de la BD\n`);

  const service = createIdealTeamService();
  const result = await service.generateIdealTeam({ players: playersList, formation: '4-3-3' });

  console.log('=== EQUIPO IDEAL ===');
  console.log(JSON.stringify(result, null, 2));

  await mongoose.disconnect();
};

test().catch(err => {
  console.error('Error:', err.message);
});
