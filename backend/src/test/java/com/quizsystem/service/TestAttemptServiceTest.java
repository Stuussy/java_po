package com.quizsystem.service;

import com.quizsystem.dto.AnswerRequest;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.repository.TestAttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestAttemptServiceTest {

    @Mock private TestAttemptRepository attemptRepository;
    @Mock private TestService testService;

    @InjectMocks
    private TestAttemptService attemptService;

    private Test testEntity;
    private TestAttempt inProgressAttempt;

    @BeforeEach
    void setUp() {
        Test.Choice correctChoice = Test.Choice.builder()
                .id("c1").text("Correct").isCorrect(true).build();
        Test.Choice wrongChoice = Test.Choice.builder()
                .id("c2").text("Wrong").isCorrect(false).build();

        Test.Question question = Test.Question.builder()
                .id("q1")
                .type(Test.QuestionType.SINGLE)
                .text("Question 1")
                .choices(List.of(correctChoice, wrongChoice))
                .points(10)
                .build();

        testEntity = Test.builder()
                .id("test-1")
                .title("Sample Test")
                .durationMinutes(30)
                .passingScore(70)
                .maxAttempts(3)
                .published(true)
                .questions(List.of(question))
                .build();

        inProgressAttempt = TestAttempt.builder()
                .id("attempt-1")
                .testId("test-1")
                .userId("user-1")
                .startedAt(LocalDateTime.now())
                .status(TestAttempt.AttemptStatus.IN_PROGRESS)
                .answers(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("Max Attempts Limit")
    class MaxAttemptsLimit {

        @org.junit.jupiter.api.Test
        @DisplayName("Should allow start when under limit")
        void startAttemptUnderLimit() {
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(Collections.emptyList());
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> {
                TestAttempt a = inv.getArgument(0);
                a.setId("new-attempt");
                return a;
            });

            TestAttempt result = attemptService.startAttempt("test-1", "user-1");

            assertNotNull(result);
            assertEquals(TestAttempt.AttemptStatus.IN_PROGRESS, result.getStatus());
            verify(attemptRepository).save(any(TestAttempt.class));
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should block when max attempts reached")
        void startAttemptMaxReached() {
            List<TestAttempt> gradedAttempts = List.of(
                    createGradedAttempt("a1"), createGradedAttempt("a2"), createGradedAttempt("a3")
            );

            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(gradedAttempts);

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> attemptService.startAttempt("test-1", "user-1"));
            assertEquals("MAX_ATTEMPTS_REACHED", ex.getMessage());
            verify(attemptRepository, never()).save(any());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should return existing in-progress attempt")
        void startAttemptReturnsExisting() {
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(List.of(inProgressAttempt));

            TestAttempt result = attemptService.startAttempt("test-1", "user-1");

            assertEquals("attempt-1", result.getId());
            assertEquals(TestAttempt.AttemptStatus.IN_PROGRESS, result.getStatus());
            verify(attemptRepository, never()).save(any(TestAttempt.class));
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should count only completed attempts towards limit")
        void inProgressNotCountedTowardsLimit() {
            TestAttempt graded1 = createGradedAttempt("a1");
            TestAttempt graded2 = createGradedAttempt("a2");

            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(List.of(graded1, graded2, inProgressAttempt));

            // In-progress attempt exists — should return it, not create a new one
            TestAttempt result = attemptService.startAttempt("test-1", "user-1");
            assertEquals("attempt-1", result.getId());
        }
    }

    @Nested
    @DisplayName("Server-Side Timer")
    class ServerSideTimer {

        @org.junit.jupiter.api.Test
        @DisplayName("Should allow save answer within time limit")
        void saveAnswerWithinTime() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(10)); // 10 min ago, 30 min test

            AnswerRequest request = new AnswerRequest("q1", List.of("c1"), null, null);

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            TestAttempt result = attemptService.saveAnswer("attempt-1", request);

            assertEquals(1, result.getAnswers().size());
            assertEquals("q1", result.getAnswers().get(0).getQuestionId());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should auto-submit and throw TIME_EXPIRED when time is up")
        void saveAnswerTimeExpired() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(31)); // Expired

            AnswerRequest request = new AnswerRequest("q1", List.of("c1"), null, null);

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> attemptService.saveAnswer("attempt-1", request));
            assertEquals("TIME_EXPIRED", ex.getMessage());

            verify(attemptRepository).save(argThat(a ->
                    a.getStatus() == TestAttempt.AttemptStatus.GRADED && a.getSubmittedAt() != null));
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should reject save answer for already submitted attempt")
        void saveAnswerAlreadySubmitted() {
            inProgressAttempt.setStatus(TestAttempt.AttemptStatus.GRADED);

            AnswerRequest request = new AnswerRequest("q1", List.of("c1"), null, null);

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> attemptService.saveAnswer("attempt-1", request));
            assertEquals("Cannot modify submitted attempt", ex.getMessage());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should auto-submit timed-out in-progress attempt on startAttempt")
        void startAttemptAutoSubmitsTimedOut() {
            TestAttempt timedOutAttempt = TestAttempt.builder()
                    .id("old-attempt")
                    .testId("test-1")
                    .userId("user-1")
                    .startedAt(LocalDateTime.now().minusMinutes(60))
                    .status(TestAttempt.AttemptStatus.IN_PROGRESS)
                    .answers(new ArrayList<>())
                    .build();

            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(List.of(timedOutAttempt));
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            TestAttempt result = attemptService.startAttempt("test-1", "user-1");

            // The timed-out attempt should have been graded
            verify(attemptRepository, times(2)).save(any(TestAttempt.class));
            // The new attempt should be IN_PROGRESS
            assertEquals(TestAttempt.AttemptStatus.IN_PROGRESS, result.getStatus());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should allow submit within time")
        void submitAttemptWithinTime() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(10));

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            TestAttempt result = attemptService.submitAttempt("attempt-1");

            assertEquals(TestAttempt.AttemptStatus.GRADED, result.getStatus());
            assertNotNull(result.getSubmittedAt());
            assertNotNull(result.getScore());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should still submit after deadline (with grace period)")
        void submitAttemptAfterDeadline() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(31));

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // submit still works, just logs a warning
            TestAttempt result = attemptService.submitAttempt("attempt-1");
            assertEquals(TestAttempt.AttemptStatus.GRADED, result.getStatus());
        }
    }

    @Nested
    @DisplayName("Grading")
    class Grading {

        @org.junit.jupiter.api.Test
        @DisplayName("Should grade correct answer with full points")
        void gradeCorrectAnswer() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(5));
            inProgressAttempt.getAnswers().add(
                    TestAttempt.Answer.builder().questionId("q1").selectedChoices(List.of("c1")).build()
            );

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            TestAttempt result = attemptService.submitAttempt("attempt-1");

            assertEquals(100.0, result.getScore());
            assertEquals(10, result.getEarnedPoints());
            assertEquals(10, result.getTotalPoints());
            assertTrue(result.getAnswers().get(0).getIsCorrect());
        }

        @org.junit.jupiter.api.Test
        @DisplayName("Should grade incorrect answer with zero points")
        void gradeIncorrectAnswer() {
            inProgressAttempt.setStartedAt(LocalDateTime.now().minusMinutes(5));
            inProgressAttempt.getAnswers().add(
                    TestAttempt.Answer.builder().questionId("q1").selectedChoices(List.of("c2")).build()
            );

            when(attemptRepository.findById("attempt-1")).thenReturn(Optional.of(inProgressAttempt));
            when(testService.getTestById("test-1")).thenReturn(testEntity);
            when(attemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            TestAttempt result = attemptService.submitAttempt("attempt-1");

            assertEquals(0.0, result.getScore());
            assertEquals(0, result.getEarnedPoints());
            assertFalse(result.getAnswers().get(0).getIsCorrect());
        }
    }

    @Nested
    @DisplayName("Completed Attempts Count")
    class CompletedAttemptsCount {

        @org.junit.jupiter.api.Test
        @DisplayName("Should count only GRADED and SUBMITTED attempts")
        void countCompletedAttempts() {
            List<TestAttempt> attempts = List.of(
                    createGradedAttempt("a1"),
                    createGradedAttempt("a2"),
                    inProgressAttempt // IN_PROGRESS — not counted
            );

            when(attemptRepository.findByUserIdAndTestId("user-1", "test-1"))
                    .thenReturn(attempts);

            long count = attemptService.getCompletedAttemptsCount("user-1", "test-1");
            assertEquals(2, count);
        }
    }

    private TestAttempt createGradedAttempt(String id) {
        return TestAttempt.builder()
                .id(id)
                .testId("test-1")
                .userId("user-1")
                .startedAt(LocalDateTime.now().minusHours(1))
                .submittedAt(LocalDateTime.now().minusMinutes(30))
                .status(TestAttempt.AttemptStatus.GRADED)
                .score(80.0)
                .answers(new ArrayList<>())
                .build();
    }
}
