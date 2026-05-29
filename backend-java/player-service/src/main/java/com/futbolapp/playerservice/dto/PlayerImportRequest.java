package com.futbolapp.playerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PlayerImportRequest {
    @NotNull
    private ApiPlayerData player;
    private Object[] statistics;
    private String team;
    private String league;
    private Location location;

    public static class ApiPlayerData {
        private Long id;
        private String name;
        private String firstname;
        private String lastname;
        private String nationality;
        private String height;
        private String weight;
        private String photo;
        private Birth birth;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getFirstname() { return firstname; }
        public void setFirstname(String firstname) { this.firstname = firstname; }

        public String getLastname() { return lastname; }
        public void setLastname(String lastname) { this.lastname = lastname; }

        public String getNationality() { return nationality; }
        public void setNationality(String nationality) { this.nationality = nationality; }

        public String getHeight() { return height; }
        public void setHeight(String height) { this.height = height; }

        public String getWeight() { return weight; }
        public void setWeight(String weight) { this.weight = weight; }

        public String getPhoto() { return photo; }
        public void setPhoto(String photo) { this.photo = photo; }

        public Birth getBirth() { return birth; }
        public void setBirth(Birth birth) { this.birth = birth; }
    }

    public static class Birth {
        private String date;
        private String place;
        private String country;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getPlace() { return place; }
        public void setPlace(String place) { this.place = place; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

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

    @NotNull
    public ApiPlayerData getPlayer() { return player; }
    public void setPlayer(ApiPlayerData player) { this.player = player; }

    public Object[] getStatistics() { return statistics; }
    public void setStatistics(Object[] statistics) { this.statistics = statistics; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public String getLeague() { return league; }
    public void setLeague(String league) { this.league = league; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
}
