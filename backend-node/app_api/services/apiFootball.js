const API_URL = 'https://v3.football.api-sports.io';

const searchPlayers = async ({ name, team, league, page = 1 }) => {
  const params = new URLSearchParams();
  if (name) params.append('search', name);
  if (team) params.append('team', team);
  if (league) params.append('league', league);
  params.append('page', page);

  const response = await fetch(`${API_URL}/players?${params}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const getPlayerById = async (id) => {
  const response = await fetch(`${API_URL}/players?id=${id}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

module.exports = { searchPlayers, getPlayerById };
