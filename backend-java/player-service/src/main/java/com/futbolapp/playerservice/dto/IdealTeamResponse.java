package com.futbolapp.playerservice.dto;

import java.util.List;

public class IdealTeamResponse {
    private TeamInfo team;
    private String source;

    public IdealTeamResponse(TeamInfo team, String source) {
        this.team = team;
        this.source = source;
    }

    public static class TeamInfo {
        private String formation;
        private List<PlayerInfo> players;
        private String reasoning;

        public TeamInfo(String formation, List<PlayerInfo> players, String reasoning) {
            this.formation = formation;
            this.players = players;
            this.reasoning = reasoning;
        }

        public String getFormation() { return formation; }
        public List<PlayerInfo> getPlayers() { return players; }
        public String getReasoning() { return reasoning; }
    }

    public static class PlayerInfo {
        private String name;
        private String position;
        private String team;
        private String league;
        private String nationality;

        public PlayerInfo(String name, String position, String team, String league, String nationality) {
            this.name = name;
            this.position = position;
            this.team = team;
            this.league = league;
            this.nationality = nationality;
        }

        public String getName() { return name; }
        public String getPosition() { return position; }
        public String getTeam() { return team; }
        public String getLeague() { return league; }
        public String getNationality() { return nationality; }
    }

    public TeamInfo getTeam() { return team; }
    public String getSource() { return source; }
}
