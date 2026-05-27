package com.futbolapp.playerservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.futbolapp.playerservice.model.Player;
import java.util.LinkedHashMap;
import java.util.Map;

public class PlayerResponse {

    @JsonProperty("_id")
    private String id;

    private String source;
    private Long apiId;
    private String name;
    private String firstname;
    private String lastname;
    private String nationality;
    private String position;
    private String birthDate;
    private String birthPlace;
    private String birthCountry;
    private String height;
    private String weight;
    private String photo;
    private String team;
    private String league;
    private Map<String, Object> location;
    private String createdBy;
    private String createdAt;
    private Integer commentCount;

    public PlayerResponse(Player player) {
        this.id = player.getId();
        this.source = player.getSource() != null ? player.getSource().name() : null;
        this.apiId = player.getApiId();
        this.name = player.getName();
        this.firstname = player.getFirstname();
        this.lastname = player.getLastname();
        this.nationality = player.getNationality();
        this.position = player.getPosition();
        this.birthDate = player.getBirthDate();
        this.birthPlace = player.getBirthPlace();
        this.birthCountry = player.getBirthCountry();
        this.height = player.getHeight();
        this.weight = player.getWeight();
        this.photo = player.getPhoto();
        this.team = player.getTeam();
        this.league = player.getLeague();

        Map<String, Object> loc = new LinkedHashMap<>();
        loc.put("lat", player.getLocationLat());
        loc.put("lng", player.getLocationLng());
        loc.put("address", player.getLocationAddress());
        this.location = loc;

        this.createdBy = player.getCreatedBy();
        this.createdAt = player.getCreatedAt() != null ? player.getCreatedAt().toString() : null;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    @JsonProperty("_id")
    public String getId() { return id; }
    public String getSource() { return source; }
    public Long getApiId() { return apiId; }
    public String getName() { return name; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
    public String getNationality() { return nationality; }
    public String getPosition() { return position; }
    public String getBirthDate() { return birthDate; }
    public String getBirthPlace() { return birthPlace; }
    public String getBirthCountry() { return birthCountry; }
    public String getHeight() { return height; }
    public String getWeight() { return weight; }
    public String getPhoto() { return photo; }
    public String getTeam() { return team; }
    public String getLeague() { return league; }
    public Map<String, Object> getLocation() { return location; }
    public String getCreatedBy() { return createdBy; }
    public String getCreatedAt() { return createdAt; }
    public Integer getCommentCount() { return commentCount; }
}
