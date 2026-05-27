package com.futbolapp.commentservice.dto;

import jakarta.validation.constraints.*;

public class CommentCreateRequest {
    @NotBlank
    private String author;

    @NotBlank
    @Size(max = 1000)
    private String text;

    @NotNull
    @Min(0)
    @Max(5)
    private Integer rating;

    private Location location;

    public static class Location {
        private Double lat;
        private Double lng;

        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
}
