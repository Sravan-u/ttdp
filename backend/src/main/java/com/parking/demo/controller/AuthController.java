package com.parking.demo.controller;

import com.parking.demo.config.AuthDTO;
import com.parking.demo.model.User;
import com.parking.demo.repository.UserRepository;
import com.parking.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        if (userRepository.existsByUserId(request.getUserId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID already registered"));
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUserId(request.getUserId());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setVehicleNumber(request.getVehicleNumber());
        user.setVehicleType(request.getVehicleType());
        user.setRole(User.Role.USER);

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful! Please login."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(new AuthDTO.AuthResponse(token, user.getRole().name(), user.getFullName(), user.getId()));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AuthDTO.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();
        if (user.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admins only."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthDTO.AuthResponse(token, user.getRole().name(), user.getFullName(), user.getId()));
    }
}
