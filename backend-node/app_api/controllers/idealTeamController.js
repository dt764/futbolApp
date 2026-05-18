const Player = require('../models/Player');
const { createIdealTeamService } = require('../services/groq');

const FANTASY_PLAYERS = [
  { name: 'Lionel Messi', position: 'Delantero', team: 'Inter Miami', league: 'MLS', nationality: 'Argentina', height: '170', weight: '72' },
  { name: 'Cristiano Ronaldo', position: 'Delantero', team: 'Al-Nassr', league: 'Saudi League', nationality: 'Portugal', height: '187', weight: '85' },
  { name: 'Kylian Mbappé', position: 'Delantero', team: 'Real Madrid', league: 'La Liga', nationality: 'Francia', height: '178', weight: '73' },
  { name: 'Erling Haaland', position: 'Delantero', team: 'Manchester City', league: 'Premier League', nationality: 'Noruega', height: '194', weight: '88' },
  { name: 'Kevin De Bruyne', position: 'Centrocampista', team: 'Manchester City', league: 'Premier League', nationality: 'Bélgica', height: '181', weight: '76' },
  { name: 'Jude Bellingham', position: 'Centrocampista', team: 'Real Madrid', league: 'La Liga', nationality: 'Inglaterra', height: '186', weight: '75' },
  { name: 'Rodri', position: 'Centrocampista', team: 'Manchester City', league: 'Premier League', nationality: 'España', height: '191', weight: '82' },
  { name: 'Virgil van Dijk', position: 'Defensa', team: 'Liverpool', league: 'Premier League', nationality: 'Países Bajos', height: '193', weight: '92' },
  { name: 'Rúben Dias', position: 'Defensa', team: 'Manchester City', league: 'Premier League', nationality: 'Portugal', height: '187', weight: '84' },
  { name: 'Theo Hernández', position: 'Defensa', team: 'AC Milan', league: 'Serie A', nationality: 'Francia', height: '181', weight: '77' },
  { name: 'Achraf Hakimi', position: 'Defensa', team: 'PSG', league: 'Ligue 1', nationality: 'Marruecos', height: '181', weight: '73' },
  { name: 'Thibaut Courtois', position: 'Portero', team: 'Real Madrid', league: 'La Liga', nationality: 'Bélgica', height: '200', weight: '96' },
  { name: 'Vinicius Jr', position: 'Delantero', team: 'Real Madrid', league: 'La Liga', nationality: 'Brasil', height: '176', weight: '73' },
  { name: 'Mohamed Salah', position: 'Delantero', team: 'Liverpool', league: 'Premier League', nationality: 'Egipto', height: '175', weight: '71' },
  { name: 'Lamine Yamal', position: 'Delantero', team: 'FC Barcelona', league: 'La Liga', nationality: 'España', height: '180', weight: '72' },
];

const generate = async (req, res) => {
  try {
    const { formation, source = 'database' } = req.body;

    let players;
    if (source === 'fantasy') {
      players = FANTASY_PLAYERS;
    } else {
      const dbPlayers = await Player.find({ source: 'api' }).lean();
      if (dbPlayers.length < 11) {
        return res.status(400).json({
          error: `Se necesitan al menos 11 jugadores importados de la API. Actualmente hay ${dbPlayers.length}.`,
        });
      }
      players = dbPlayers.map(p => ({
        name: p.name,
        position: p.position || 'desconocida',
        team: p.team,
        league: p.league,
        nationality: p.nationality,
        height: p.height,
        weight: p.weight,
      }));
    }

    const service = createIdealTeamService();
    const team = await service.generateIdealTeam({ players, formation });
    res.json({ team, source });
  } catch (err) {
    if (err.message?.startsWith('Groq API error') || err.message?.includes('GROQ_API_KEY')) {
      return res.status(502).json({ error: 'Error al contactar con Groq', detail: err.message });
    }
    res.status(500).json({ error: 'Error al generar el equipo ideal', detail: err.message });
  }
};

module.exports = { generate };
