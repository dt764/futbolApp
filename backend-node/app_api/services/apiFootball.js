const API_URL = 'https://v3.football.api-sports.io';

const apiFetch = async (endpoint, params) => {
  const query = params ? `?${params}` : '';
  const response = await fetch(`${API_URL}${endpoint}${query}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
  });
  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }
  return response.json();
};

const resolveToId = async (name, type) => {
  if (!name || /^\d+$/.test(name)) return name;
  const endpoint = type === 'team' ? '/teams' : '/leagues';
  const params = new URLSearchParams({ search: name });
  const data = await apiFetch(endpoint, params);
  const item = data.response?.[0];
  if (!item) throw new Error(`No se encontró el ${type} "${name}" en API-Football`);
  return type === 'team' ? item.team.id : item.league.id;
};

const searchPlayers = async ({ name, team, league, page = 1 }) => {
  const [teamId, leagueId] = await Promise.all([
    team ? resolveToId(team, 'team') : null,
    league ? resolveToId(league, 'league') : null,
  ]);

  const params = new URLSearchParams();
  if (name) params.append('search', name);
  if (teamId) params.append('team', teamId);
  if (leagueId) params.append('league', leagueId);
  params.append('page', page);

  return apiFetch('/players', params);
};

const getPlayerById = async (id, season) => {
  const params = new URLSearchParams({ id, season: season || new Date().getFullYear() });
  return apiFetch('/players', params);
};

module.exports = { searchPlayers, getPlayerById };
