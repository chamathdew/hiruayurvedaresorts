package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.User;
import com.hiruresort.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String storedPassword = user.getPassword();

            // Check if stored password is a BCrypt hash (from old Node.js backend)
            // or a plain text password (new admin user created by Spring Boot)
            boolean passwordMatches;
            if (storedPassword != null && storedPassword.startsWith("$2")) {
                // BCrypt hash - use BCrypt comparison
                passwordMatches = passwordEncoder.matches(password, storedPassword);
            } else {
                // Plain text comparison for newly created users
                passwordMatches = storedPassword != null && storedPassword.equals(password);
            }

            if (passwordMatches) {
                Map<String, Object> response = new HashMap<>();
                response.put("_id", user.getId());
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("role", user.getRole());
                response.put("hotelBranch", user.getHotelBranch());
                response.put("token", "dummy-jwt-token-for-now");
                response.put("success", true);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(400).body("Wrong password!");
            }
        } else {
            return ResponseEntity.status(404).body("User not found!");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(201).body(savedUser);
    }
}
