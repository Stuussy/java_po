package com.quizsystem.controller;

import com.quizsystem.dto.AuthRequest;
import com.quizsystem.dto.AuthResponse;
import com.quizsystem.dto.RegisterRequest;
import com.quizsystem.dto.UserResponse;
import com.quizsystem.service.AuthService;
import com.quizsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/update-avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestBody java.util.Map<String, String> request, Authentication authentication) {
        String email = authentication.getName();
        String avatar = request.get("avatar");
        return ResponseEntity.ok(userService.updateAvatar(email, avatar));
    }
}
