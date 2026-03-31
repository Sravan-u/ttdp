package com.parking.demo.config;

public class AuthDTO {

    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String userId;
        private String phoneNumber;
        private String vehicleNumber;
        private String vehicleType;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getVehicleNumber() { return vehicleNumber; }
        public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String role;
        private String fullName;
        private Long userId;

        public AuthResponse(String token, String role, String fullName, Long userId) {
            this.token = token;
            this.role = role;
            this.fullName = fullName;
            this.userId = userId;
        }

        public String getToken() { return token; }
        public String getRole() { return role; }
        public String getFullName() { return fullName; }
        public Long getUserId() { return userId; }
    }
}
