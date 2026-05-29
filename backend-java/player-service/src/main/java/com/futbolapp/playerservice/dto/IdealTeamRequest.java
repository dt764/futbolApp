package com.futbolapp.playerservice.dto;

public class IdealTeamRequest {
    private String formation;
    private String source = "database";

    public String getFormation() { return formation; }
    public void setFormation(String formation) { this.formation = formation; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
