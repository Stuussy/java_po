package com.quizsystem.service;

import com.quizsystem.dto.AuthResponse;
import com.quizsystem.dto.RegisterRequest;
import com.quizsystem.model.EmailVerificationToken;
import com.quizsystem.model.User;
import com.quizsystem.repository.EmailVerificationTokenRepository;
import com.quizsystem.repository.PasswordResetTokenRepository;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository resetTokenRepository;
    @Mock private EmailVerificationTokenRepository verificationTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("test@example.com")
                .name("Test User")
                .passwordHash("encodedPassword")
                .role(User.UserRole.USER)
                .emailVerified(false)
                .avatar("avatar1")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Registration")
    class Registration {

        @Test
        @DisplayName("Should register user and require email verification")
        void registerShouldRequireVerification() {
            RegisterRequest request = new RegisterRequest("Test", "new@example.com", "pass123", "Org");

            when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
            when(passwordEncoder.encode("pass123")).thenReturn("encodedPass");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId("new-id");
                return u;
            });
            when(verificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Map<String, Object> result = authService.register(request);

            assertTrue((Boolean) result.get("requiresVerification"));
            assertEquals("new@example.com", result.get("email"));

            verify(emailService).sendEmailVerificationCode(eq("new@example.com"), eq("Test"), anyString());
            verify(verificationTokenRepository).deleteByEmail("new@example.com");
            verify(verificationTokenRepository).save(any(EmailVerificationToken.class));
        }

        @Test
        @DisplayName("Should throw when email already registered")
        void registerShouldThrowForDuplicateEmail() {
            RegisterRequest request = new RegisterRequest("Test", "existing@example.com", "pass123", null);
            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
            assertEquals("Email already registered", ex.getMessage());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should generate 6-digit verification code")
        void registerShouldGenerate6DigitCode() {
            RegisterRequest request = new RegisterRequest("Test", "new@example.com", "pass123", null);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId("id");
                return u;
            });
            when(verificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            authService.register(request);

            ArgumentCaptor<EmailVerificationToken> captor = ArgumentCaptor.forClass(EmailVerificationToken.class);
            verify(verificationTokenRepository).save(captor.capture());

            String code = captor.getValue().getCode();
            assertEquals(6, code.length());
            assertTrue(code.matches("\\d{6}"));
            assertFalse(captor.getValue().isUsed());
            assertTrue(captor.getValue().getExpiresAt().isAfter(LocalDateTime.now()));
        }
    }

    @Nested
    @DisplayName("Email Verification")
    class EmailVerification {

        @Test
        @DisplayName("Should verify email with valid code and return JWT")
        void verifyEmailSuccess() {
            EmailVerificationToken token = EmailVerificationToken.builder()
                    .email("test@example.com")
                    .code("123456")
                    .used(false)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();

            UserDetails userDetails = mock(UserDetails.class);

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.findByEmailAndCode("test@example.com", "123456"))
                    .thenReturn(Optional.of(token));
            when(verificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
            when(jwtUtil.generateToken(userDetails, "USER")).thenReturn("jwt-token");

            AuthResponse response = authService.verifyEmail("test@example.com", "123456");

            assertEquals("jwt-token", response.getToken());
            assertEquals("test@example.com", response.getEmail());

            assertTrue(token.isUsed());

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertTrue(userCaptor.getValue().getEmailVerified());
        }

        @Test
        @DisplayName("Should reject invalid verification code")
        void verifyEmailInvalidCode() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.findByEmailAndCode("test@example.com", "000000"))
                    .thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.verifyEmail("test@example.com", "000000"));
            assertEquals("Invalid verification code", ex.getMessage());
        }

        @Test
        @DisplayName("Should reject expired verification code")
        void verifyEmailExpiredCode() {
            EmailVerificationToken expiredToken = EmailVerificationToken.builder()
                    .email("test@example.com")
                    .code("123456")
                    .used(false)
                    .createdAt(LocalDateTime.now().minusHours(1))
                    .expiresAt(LocalDateTime.now().minusMinutes(1))
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.findByEmailAndCode("test@example.com", "123456"))
                    .thenReturn(Optional.of(expiredToken));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.verifyEmail("test@example.com", "123456"));
            assertEquals("Verification code has expired", ex.getMessage());
        }

        @Test
        @DisplayName("Should reject already used code")
        void verifyEmailUsedCode() {
            EmailVerificationToken usedToken = EmailVerificationToken.builder()
                    .email("test@example.com")
                    .code("123456")
                    .used(true)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.findByEmailAndCode("test@example.com", "123456"))
                    .thenReturn(Optional.of(usedToken));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.verifyEmail("test@example.com", "123456"));
            assertEquals("This code has already been used", ex.getMessage());
        }

        @Test
        @DisplayName("Should reject verification for already verified email")
        void verifyEmailAlreadyVerified() {
            testUser.setEmailVerified(true);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.verifyEmail("test@example.com", "123456"));
            assertEquals("Email already verified", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("Login")
    class Login {

        @Test
        @DisplayName("Should block login for unverified non-admin user")
        void loginUnverifiedUserShouldThrow() {
            testUser.setEmailVerified(false);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.login(new com.quizsystem.dto.AuthRequest("test@example.com", "pass123")));
            assertEquals("EMAIL_NOT_VERIFIED", ex.getMessage());

            verify(emailService).sendEmailVerificationCode(eq("test@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("Should allow login for admin even without email verification")
        void loginAdminShouldSkipVerification() {
            User adminUser = User.builder()
                    .id("admin-1")
                    .email("admin@quiz.com")
                    .name("Admin")
                    .passwordHash("encoded")
                    .role(User.UserRole.ADMIN)
                    .emailVerified(false)
                    .avatar("avatar1")
                    .build();

            UserDetails userDetails = mock(UserDetails.class);

            when(userRepository.findByEmail("admin@quiz.com")).thenReturn(Optional.of(adminUser));
            when(userDetailsService.loadUserByUsername("admin@quiz.com")).thenReturn(userDetails);
            when(jwtUtil.generateToken(userDetails, "ADMIN")).thenReturn("admin-jwt");

            AuthResponse response = authService.login(new com.quizsystem.dto.AuthRequest("admin@quiz.com", "admin123"));

            assertEquals("admin-jwt", response.getToken());
            assertEquals("ADMIN", response.getRole());
            verify(emailService, never()).sendEmailVerificationCode(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Should allow login for verified user")
        void loginVerifiedUser() {
            testUser.setEmailVerified(true);
            UserDetails userDetails = mock(UserDetails.class);

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
            when(jwtUtil.generateToken(userDetails, "USER")).thenReturn("user-jwt");

            AuthResponse response = authService.login(new com.quizsystem.dto.AuthRequest("test@example.com", "pass123"));

            assertEquals("user-jwt", response.getToken());
            assertEquals("USER", response.getRole());
        }
    }

    @Nested
    @DisplayName("Resend Verification")
    class ResendVerification {

        @Test
        @DisplayName("Should resend code for unverified user")
        void resendSuccess() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(verificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            assertDoesNotThrow(() -> authService.resendVerificationCode("test@example.com"));

            verify(verificationTokenRepository).deleteByEmail("test@example.com");
            verify(verificationTokenRepository).save(any(EmailVerificationToken.class));
            verify(emailService).sendEmailVerificationCode(eq("test@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw for already verified user")
        void resendForVerifiedUser() {
            testUser.setEmailVerified(true);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.resendVerificationCode("test@example.com"));
            assertEquals("Email already verified", ex.getMessage());
        }
    }
}
