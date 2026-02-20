package com.quizsystem.service;

import com.quizsystem.dto.AuthRequest;
import com.quizsystem.dto.AuthResponse;
import com.quizsystem.dto.RegisterRequest;
import com.quizsystem.model.EmailVerificationToken;
import com.quizsystem.model.PasswordResetToken;
import com.quizsystem.model.User;
import com.quizsystem.repository.EmailVerificationTokenRepository;
import com.quizsystem.repository.PasswordResetTokenRepository;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public Map<String, Object> register(RegisterRequest request) {
        log.debug("Processing registration for email: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration rejected — duplicate email: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.USER)
                .organization(request.getOrganization())
                .avatar("avatar1")
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        sendVerificationCode(user);

        log.info("User registered, verification email sent to {}", user.getEmail());

        return Map.of(
                "requiresVerification", true,
                "email", user.getEmail(),
                "message", "Verification code sent to your email"
        );
    }

    public AuthResponse verifyEmail(String email, String code) {
        log.debug("Verifying email {} with code", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email already verified");
        }

        EmailVerificationToken token = verificationTokenRepository.findByEmailAndCode(email, code)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));

        if (token.isUsed()) {
            throw new RuntimeException("This code has already been used");
        }

        if (token.isExpired()) {
            throw new RuntimeException("Verification code has expired");
        }

        token.setUsed(true);
        verificationTokenRepository.save(token);

        user.setEmailVerified(true);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails, user.getRole().name());

        log.info("Email verified for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .avatar(user.getAvatar())
                .build();
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email already verified");
        }

        sendVerificationCode(user);
        log.info("Verification code resent to {}", email);
    }

    private void sendVerificationCode(User user) {
        verificationTokenRepository.deleteByEmail(user.getEmail());

        String code = String.format("%06d", RANDOM.nextInt(1000000));

        EmailVerificationToken token = EmailVerificationToken.builder()
                .email(user.getEmail())
                .code(code)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        verificationTokenRepository.save(token);
        emailService.sendEmailVerificationCode(user.getEmail(), user.getName(), code);
    }

    public AuthResponse login(AuthRequest request) {
        log.debug("Authenticating user: {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified()) && user.getRole() != User.UserRole.ADMIN) {
            log.info("Login blocked for unverified user: {}, resending verification code", request.getEmail());
            sendVerificationCode(user);
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
        }

        log.info("User authenticated successfully: {}, role: {}", user.getEmail(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .avatar(user.getAvatar())
                .build();
    }

    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        resetTokenRepository.deleteByEmail(email);

        String tokenValue = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(email)
                .token(tokenValue)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        resetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(email, user.getName(), tokenValue);

        log.info("Password reset token generated and email sent for {}", email);
    }

    public boolean validateResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .map(t -> !t.isUsed() && !t.isExpired())
                .orElse(false);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("This reset token has expired");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getEmail());
    }
}
