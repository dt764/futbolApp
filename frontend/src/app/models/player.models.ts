export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Player {
  _id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  nationality?: string;
  position?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
  photo?: string;
  team?: string;
  league?: string;
  location?: GeoLocation;
}

export interface PlayersResponse {
  players: Player[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    nationality: string;
    height: string;
    weight: string;
    photo: string;
    birth: { date: string; place: string; country: string };
  };
  statistics: Array<{
    games: { position: string };
    team: { name: string };
    league: { name: string };
  }>;
}

export interface ApiSearchResponse {
  results: number;
  response: ApiPlayer[];
}

export interface IdealTeamPlayer {
  name: string;
  position: string;
  team: string;
  league: string;
  nationality: string;
}

export interface IdealTeamResponse {
  team: {
    formation: string;
    players: IdealTeamPlayer[];
    reasoning?: string;
  };
  source: string;
}
