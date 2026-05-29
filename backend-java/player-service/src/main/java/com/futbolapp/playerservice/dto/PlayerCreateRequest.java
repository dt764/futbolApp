package com.futbolapp.playerservice.dto;

import jakarta.validation.constraints.NotBlank;

public class PlayerCreateRequest {
    @NotBlank
    private String name;
    private String firstname;
    private String lastname;
    private String nationality;
    private String position;
    private String birthDate;
    private String height;
    private String weight;
    private String photo;
    private String team;
    private String league;
    private Location location;

    public static class Location {
        private Double lat;
        private Double lng;
        private String address;

        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    @NotBlank
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }

    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }

    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public String getLeague() { return league; }
    public void setLeague(String league) { this.league = league; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
}
