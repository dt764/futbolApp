package com.futbolapp.playerservice.dto;

public class AuthResponse {
    private String token;
    private UserInfo user;

    public AuthResponse(String token, UserInfo user) {
        this.token = token;
        this.user = user;
    }

    public static class UserInfo {
        private String uid;
        private String email;
        private String displayName;
        private String role;

        public UserInfo(String uid, String email, String displayName, String role) {
            this.uid = uid;
            this.email = email;
            this.displayName = displayName;
            this.role = role;
        }

        public String getUid() { return uid; }
        public String getEmail() { return email; }
        public String getDisplayName() { return displayName; }
        public String getRole() { return role; }
    }

    public String getToken() { return token; }
    public UserInfo getUser() { return user; }
}
