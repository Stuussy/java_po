package com.quizsystem.service;

import com.quizsystem.dto.AnswerRequest;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestAttemptService {

    private final TestAttemptRepository attemptRepository;
    private final TestService testService;

    public TestAttempt startAttempt(String testId, String userId) {
        Test test = testService.getTestById(testId);

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

        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(TestAttempt.AttemptStatus.SUBMITTED);

        
        gradeAttempt(attempt);

        return attemptRepository.save(attempt);
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
