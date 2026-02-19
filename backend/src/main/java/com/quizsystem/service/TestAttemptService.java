package com.quizsystem.service;

import com.quizsystem.dto.AnswerRequest;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestAttemptService {

    private final TestAttemptRepository attemptRepository;
    private final TestService testService;

    public TestAttempt startAttempt(String testId, String userId) {
        Test test = testService.getTestById(testId);

        // Check max attempts limit
        int maxAttempts = test.getMaxAttempts() != null ? test.getMaxAttempts() : 3;
        List<TestAttempt> completedAttempts = attemptRepository.findByUserIdAndTestId(userId, testId)
                .stream()
                .filter(a -> a.getStatus() == TestAttempt.AttemptStatus.GRADED
                        || a.getStatus() == TestAttempt.AttemptStatus.SUBMITTED)
                .collect(Collectors.toList());

        if (completedAttempts.size() >= maxAttempts) {
            throw new RuntimeException("MAX_ATTEMPTS_REACHED");
        }

        // Also check for an existing in-progress attempt and return it instead of creating a new one
        List<TestAttempt> inProgressAttempts = attemptRepository.findByUserIdAndTestId(userId, testId)
                .stream()
                .filter(a -> a.getStatus() == TestAttempt.AttemptStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        if (!inProgressAttempts.isEmpty()) {
            TestAttempt existing = inProgressAttempts.get(0);
            // Check if the in-progress attempt has timed out
            if (isAttemptTimedOut(existing, test)) {
                existing.setSubmittedAt(LocalDateTime.now());
                existing.setStatus(TestAttempt.AttemptStatus.SUBMITTED);
                gradeAttempt(existing);
                attemptRepository.save(existing);
                log.info("Auto-submitted timed-out attempt {} for user {}", existing.getId(), userId);
                // After auto-submitting, check again if max attempts reached
                if (completedAttempts.size() + 1 >= maxAttempts) {
                    throw new RuntimeException("MAX_ATTEMPTS_REACHED");
                }
            } else {
                return existing;
            }
        }

        TestAttempt attempt = TestAttempt.builder()
                .testId(testId)
                .userId(userId)
                .startedAt(LocalDateTime.now())
                .status(TestAttempt.AttemptStatus.IN_PROGRESS)
                .answers(new ArrayList<>())
                .build();

        return attemptRepository.save(attempt);
    }

    public TestAttempt saveAnswer(String attemptId, AnswerRequest answerRequest) {
        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot modify submitted attempt");
        }

        // Server-side timer check
        Test test = testService.getTestById(attempt.getTestId());
        if (isAttemptTimedOut(attempt, test)) {
            // Auto-submit on timeout
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt.setStatus(TestAttempt.AttemptStatus.SUBMITTED);
            gradeAttempt(attempt);
            attemptRepository.save(attempt);
            throw new RuntimeException("TIME_EXPIRED");
        }

        attempt.getAnswers().removeIf(a -> a.getQuestionId().equals(answerRequest.getQuestionId()));

        TestAttempt.Answer answer = TestAttempt.Answer.builder()
                .questionId(answerRequest.getQuestionId())
                .selectedChoices(answerRequest.getSelectedChoices())
                .textAnswer(answerRequest.getTextAnswer())
                .numericAnswer(answerRequest.getNumericAnswer())
                .build();

        attempt.getAnswers().add(answer);

        return attemptRepository.save(attempt);
    }

    public TestAttempt submitAttempt(String attemptId) {
        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Attempt already submitted");
        }

        // Server-side timer check — allow a small grace period (30 seconds)
        Test test = testService.getTestById(attempt.getTestId());
        if (test.getDurationMinutes() != null && attempt.getStartedAt() != null) {
            LocalDateTime deadline = attempt.getStartedAt()
                    .plusMinutes(test.getDurationMinutes())
                    .plusSeconds(30); // 30s grace
            if (LocalDateTime.now().isAfter(deadline)) {
                log.warn("Attempt {} submitted after deadline, auto-grading with current answers", attemptId);
            }
        }

        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(TestAttempt.AttemptStatus.SUBMITTED);

        gradeAttempt(attempt);

        return attemptRepository.save(attempt);
    }

    private boolean isAttemptTimedOut(TestAttempt attempt, Test test) {
        if (test.getDurationMinutes() == null || attempt.getStartedAt() == null) {
            return false;
        }
        LocalDateTime deadline = attempt.getStartedAt().plusMinutes(test.getDurationMinutes());
        return LocalDateTime.now().isAfter(deadline);
    }

    public long getCompletedAttemptsCount(String userId, String testId) {
        return attemptRepository.findByUserIdAndTestId(userId, testId)
                .stream()
                .filter(a -> a.getStatus() == TestAttempt.AttemptStatus.GRADED
                        || a.getStatus() == TestAttempt.AttemptStatus.SUBMITTED)
                .count();
    }

    private void gradeAttempt(TestAttempt attempt) {
        Test test = testService.getTestById(attempt.getTestId());

        int totalPoints = 0;
        int earnedPoints = 0;

        for (Test.Question question : test.getQuestions()) {
            totalPoints += question.getPoints();

            TestAttempt.Answer answer = attempt.getAnswers().stream()
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            if (answer != null) {
                boolean isCorrect = checkAnswer(question, answer);
                answer.setIsCorrect(isCorrect);
                answer.setPointsAwarded(isCorrect ? question.getPoints() : 0);
                earnedPoints += answer.getPointsAwarded();
            }
        }

        attempt.setTotalPoints(totalPoints);
        attempt.setEarnedPoints(earnedPoints);
        attempt.setScore(totalPoints > 0 ? (double) earnedPoints / totalPoints * 100 : 0);
        attempt.setStatus(TestAttempt.AttemptStatus.GRADED);
    }

    private boolean checkAnswer(Test.Question question, TestAttempt.Answer answer) {
        switch (question.getType()) {
            case SINGLE:
                if (answer.getSelectedChoices() == null || answer.getSelectedChoices().isEmpty()) {
                    return false;
                }
                String selectedChoice = answer.getSelectedChoices().get(0);
                return question.getChoices().stream()
                        .anyMatch(c -> c.getId().equals(selectedChoice) && c.getIsCorrect());

            case MULTIPLE:
                if (answer.getSelectedChoices() == null) {
                    return false;
                }
                List<String> correctChoices = question.getChoices().stream()
                        .filter(Test.Choice::getIsCorrect)
                        .map(Test.Choice::getId)
                        .collect(Collectors.toList());
                return answer.getSelectedChoices().size() == correctChoices.size() &&
                        answer.getSelectedChoices().containsAll(correctChoices);

            case TRUEFALSE:
                if (answer.getSelectedChoices() == null || answer.getSelectedChoices().isEmpty()) {
                    return false;
                }
                String selected = answer.getSelectedChoices().get(0);
                return question.getChoices().stream()
                        .anyMatch(c -> c.getId().equals(selected) && c.getIsCorrect());

            case NUMERIC:
                if (answer.getNumericAnswer() == null || question.getCorrectAnswer() == null) {
                    return false;
                }
                return answer.getNumericAnswer().trim().equals(question.getCorrectAnswer().trim());

            case OPEN:
                return false;

            default:
                return false;
        }
    }

    public TestAttempt getAttemptById(String attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
    }

    public List<TestAttempt> getUserAttempts(String userId) {
        return attemptRepository.findByUserId(userId);
    }

    public List<TestAttempt> getTestAttempts(String testId) {
        return attemptRepository.findByTestId(testId);
    }
}
