package com.quizsystem.controller;

import com.quizsystem.dto.AuthResponse;
import com.quizsystem.service.AuthService;
import com.quizsystem.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private AuthService authService;
    @Mock private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Nested
    @DisplayName("Login endpoint")
    class LoginEndpoint {

        @Test
        @DisplayName("Should return 403 with verification info when email not verified")
        void loginUnverifiedReturns403() {
            when(authService.login(any())).thenThrow(new RuntimeException("EMAIL_NOT_VERIFIED"));

            var request = new com.quizsystem.dto.AuthRequest("user@test.com", "pass");
            ResponseEntity<?> response = authController.login(request);

            assertEquals(403, response.getStatusCode().value());

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertNotNull(body);
            assertTrue((Boolean) body.get("requiresVerification"));
            assertEquals("user@test.com", body.get("email"));
        }

        @Test
        @DisplayName("Should return 200 with token for verified user")
        void loginVerifiedReturns200() {
            AuthResponse authResponse = AuthResponse.builder()
                    .token("jwt").email("user@test.com").name("User").role("USER").userId("1").build();
            when(authService.login(any())).thenReturn(authResponse);

            var request = new com.quizsystem.dto.AuthRequest("user@test.com", "pass");
            ResponseEntity<?> response = authController.login(request);

            assertEquals(200, response.getStatusCode().value());
            assertEquals(authResponse, response.getBody());
        }

        @Test
        @DisplayName("Should re-throw non-verification errors")
        void loginOtherErrorRethrows() {
            when(authService.login(any())).thenThrow(new RuntimeException("Bad credentials"));

            var request = new com.quizsystem.dto.AuthRequest("user@test.com", "pass");

            assertThrows(RuntimeException.class, () -> authController.login(request));
        }
    }

    @Nested
    @DisplayName("Verify Email endpoint")
    class VerifyEmailEndpoint {

        @Test
        @DisplayName("Should return JWT on successful verification")
        void verifyEmailSuccess() {
            AuthResponse authResponse = AuthResponse.builder()
                    .token("jwt").email("user@test.com").name("User").role("USER").userId("1").build();
            when(authService.verifyEmail("user@test.com", "123456")).thenReturn(authResponse);

            ResponseEntity<AuthResponse> response = authController.verifyEmail(
                    Map.of("email", "user@test.com", "code", "123456"));

            assertEquals(200, response.getStatusCode().value());
            assertEquals("jwt", response.getBody().getToken());
        }
    }

    @Nested
    @DisplayName("Resend Verification endpoint")
    class ResendVerificationEndpoint {

        @Test
        @DisplayName("Should always return success message (security)")
        void resendAlwaysReturnsOk() {
            doThrow(new RuntimeException("User not found")).when(authService).resendVerificationCode("unknown@test.com");

            ResponseEntity<Map<String, String>> response = authController.resendVerification(
                    Map.of("email", "unknown@test.com"));

            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody().get("message"));
        }
    }
}
