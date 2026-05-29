package com.futbolapp.commentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class CommentResponse {
    private String id;
    private String playerId;
    private String author;
    private String text;
    private Integer rating;
    private Location location;
    private LocalDateTime createdAt;

    public CommentResponse(String id, String playerId, String author, String text,
                           Integer rating, Double locationLat, Double locationLng,
                           LocalDateTime createdAt) {
        this.id = id;
        this.playerId = playerId;
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.location = new Location(locationLat, locationLng);
        this.createdAt = createdAt;
    }

    public static class Location {
        private Double lat;
        private Double lng;

        public Location(Double lat, Double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public Double getLat() { return lat; }
        public Double getLng() { return lng; }
    }

    @JsonProperty("_id")
    public String getId() { return id; }
    public String getPlayerId() { return playerId; }
    public String getAuthor() { return author; }
    public String getText() { return text; }
    public Integer getRating() { return rating; }
    public Location getLocation() { return location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
