package com.quizsystem.controller;

import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.TestAttemptService;
import com.quizsystem.service.TestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestControllerTest {

    @Mock private TestService testService;
    @Mock private TestAttemptService attemptService;
    @Mock private UserRepository userRepository;
    @Mock private Authentication authentication;

    @InjectMocks
    private TestController testController;

    private User testUser;
    private Test testEntity;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1").email("user@test.com").name("User")
                .role(User.UserRole.USER).build();

        testEntity = Test.builder()
                .id("test-1").title("Test").maxAttempts(3)
                .durationMinutes(30).passingScore(70)
                .published(true).questions(new ArrayList<>()).build();
    }

    @Nested
    @DisplayName("Start Test endpoint")
    class StartTestEndpoint {

        @org.junit.jupiter.api.Test
        @DisplayName("Should return 400 when max attempts reached")
        void startTestMaxAttempts() {
            when(authentication.getName()).thenReturn("user@test.com");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
            when(attemptService.startAttempt("test-1", "user-1"))
                    .thenThrow(new RuntimeException("MAX_ATTEMPTS_REACHED"));

            ResponseEntity<?> response = testController.startTest("test-1", authentication);

            assertEquals(400, response.getStatusCode().value());

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertNotNull(body);
            assertEquals("MAX_ATTEMPTS_REACHED", body.get("error"));
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should return 200 with attempt on success")
        void startTestSuccess() {
            TestAttempt attempt = TestAttempt.builder()
                    .id("attempt-1").testId("test-1").userId("user-1")
                    .status(TestAttempt.AttemptStatus.IN_PROGRESS).build();

            when(authentication.getName()).thenReturn("user@test.com");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
            when(attemptService.startAttempt("test-1", "user-1")).thenReturn(attempt);

            ResponseEntity<?> response = testController.startTest("test-1", authentication);

            assertEquals(200, response.getStatusCode().value());
            assertEquals(attempt, response.getBody());
        }
    }

    @Nested
    @DisplayName("Save Answer endpoint")
    class SaveAnswerEndpoint {

        @org.junit.jupiter.api.Test
        @DisplayName("Should return 400 when time expired")
        void saveAnswerTimeExpired() {
            var request = new com.quizsystem.dto.AnswerRequest("q1", null, null, null);
            when(attemptService.saveAnswer(eq("attempt-1"), any()))
                    .thenThrow(new RuntimeException("TIME_EXPIRED"));

            ResponseEntity<?> response = testController.saveAnswer("test-1", "attempt-1", request);

            assertEquals(400, response.getStatusCode().value());

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertNotNull(body);
            assertEquals("TIME_EXPIRED", body.get("error"));
        }
    }

    @Nested
    @DisplayName("Attempts Info endpoint")
    class AttemptsInfoEndpoint {

        @org.junit.jupiter.api.Test
        @DisplayName("Should return correct attempts info")
        void getAttemptsInfo() {
            when(authentication.getName()).thenReturn("user@test.com");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptService.getCompletedAttemptsCount("user-1", "test-1")).thenReturn(2L);

            ResponseEntity<Map<String, Object>> response = testController.getAttemptsInfo("test-1", authentication);

            assertEquals(200, response.getStatusCode().value());

            Map<String, Object> body = response.getBody();
            assertNotNull(body);
            assertEquals(2L, body.get("completedAttempts"));
            assertEquals(3, body.get("maxAttempts"));
            assertTrue((Boolean) body.get("canStart"));
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should return canStart=false when limit reached")
        void getAttemptsInfoLimitReached() {
            when(authentication.getName()).thenReturn("user@test.com");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptService.getCompletedAttemptsCount("user-1", "test-1")).thenReturn(3L);

            ResponseEntity<Map<String, Object>> response = testController.getAttemptsInfo("test-1", authentication);

            Map<String, Object> body = response.getBody();
            assertNotNull(body);
            assertFalse((Boolean) body.get("canStart"));
        }
    }
}
