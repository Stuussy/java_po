package com.quizsystem.controller;

import com.quizsystem.dto.AuthRequest;
import com.quizsystem.dto.AuthResponse;
import com.quizsystem.dto.RegisterRequest;
import com.quizsystem.dto.UserResponse;
import com.quizsystem.service.AuthService;
import com.quizsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        try {
            var result = authService.register(request);
            log.info("Registration successful for email: {}, verification required", request.getEmail());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.warn("Registration failed for email: {} — {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        try {
            var result = authService.login(request);
            log.info("Login successful for email: {}, role: {}", request.getEmail(), result.getRole());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if ("EMAIL_NOT_VERIFIED".equals(e.getMessage())) {
                log.warn("Login blocked — email not verified: {}", request.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("requiresVerification", true);
                response.put("email", request.getEmail());
                response.put("message", "Email not verified. A new verification code has been sent.");
                return ResponseEntity.status(403).body(response);
            }
            log.warn("Login failed for email: {} — {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("Email verification attempt for: {}", email);
        try {
            AuthResponse result = authService.verifyEmail(email, request.get("code"));
            log.info("Email verified successfully for: {}", email);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.warn("Email verification failed for: {} — {}", email, e.getMessage());
            throw e;
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("Resend verification code request for: {}", email);
        try {
            authService.resendVerificationCode(email);
            log.info("Verification code resent to: {}", email);
        } catch (Exception e) {
            log.debug("Resend verification silently failed for: {} — {}", email, e.getMessage());
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, a new verification code has been sent");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        log.debug("Get current user request for: {}", email);
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/update-avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestBody Map<String, String> request, Authentication authentication) {
        String email = authentication.getName();
        String avatar = request.get("avatar");
        log.info("Avatar update for user: {}, avatar: {}", email, avatar);
        return ResponseEntity.ok(userService.updateAvatar(email, avatar));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("Password reset requested for: {}", email);
        try {
            authService.createPasswordResetToken(email);
        } catch (Exception e) {
            log.debug("Password reset silently failed for: {} — {}", email, e.getMessage());
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, password reset instructions have been sent");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        log.info("Password reset execution with token: {}...", token != null && token.length() > 8 ? token.substring(0, 8) : "null");
        try {
            authService.resetPassword(token, request.get("newPassword"));
            log.info("Password reset successful");
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Password reset failed — {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        boolean valid = authService.validateResetToken(token);
        log.debug("Reset token validation: valid={}", valid);
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", valid);
        return ResponseEntity.ok(response);
    }
}
