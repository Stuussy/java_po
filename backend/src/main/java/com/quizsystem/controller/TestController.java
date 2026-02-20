package com.quizsystem.controller;

import com.quizsystem.dto.AnswerRequest;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.TestAttemptService;
import com.quizsystem.service.TestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final TestAttemptService attemptService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Test>> getAllPublishedTests() {
        log.debug("Fetching all published tests");
        return ResponseEntity.ok(testService.getAllPublishedTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable String id) {
        log.debug("Fetching test by id: {}", id);
        return ResponseEntity.ok(testService.getTestById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Test>> searchTests(@RequestParam String query) {
        log.debug("Searching tests with query: {}", query);
        return ResponseEntity.ok(testService.searchTests(query));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startTest(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.info("User {} starting test {}", user.getId(), id);
        try {
            TestAttempt attempt = attemptService.startAttempt(id, user.getId());
            log.info("Test {} started by user {}, attemptId: {}", id, user.getId(), attempt.getId());
            return ResponseEntity.ok(attempt);
        } catch (RuntimeException e) {
            if ("MAX_ATTEMPTS_REACHED".equals(e.getMessage())) {
                log.warn("User {} blocked from test {} — max attempts reached", user.getId(), id);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "MAX_ATTEMPTS_REACHED");
                error.put("message", "You have reached the maximum number of attempts for this test");
                return ResponseEntity.badRequest().body(error);
            }
            throw e;
        }
    }

    @PostMapping("/{testId}/attempt/{attemptId}/answer")
    public ResponseEntity<?> saveAnswer(
            @PathVariable String testId,
            @PathVariable String attemptId,
            @RequestBody AnswerRequest answerRequest) {
        log.debug("Saving answer for attempt {}, question {}", attemptId, answerRequest.getQuestionId());
        try {
            return ResponseEntity.ok(attemptService.saveAnswer(attemptId, answerRequest));
        } catch (RuntimeException e) {
            if ("TIME_EXPIRED".equals(e.getMessage())) {
                log.warn("Answer save blocked for attempt {} — time expired, auto-submitted", attemptId);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "TIME_EXPIRED");
                error.put("message", "Time has expired. Your test has been auto-submitted.");
                return ResponseEntity.badRequest().body(error);
            }
            throw e;
        }
    }

    @PostMapping("/{testId}/attempt/{attemptId}/submit")
    public ResponseEntity<TestAttempt> submitAttempt(
            @PathVariable String testId,
            @PathVariable String attemptId) {
        log.info("Submitting attempt {} for test {}", attemptId, testId);
        TestAttempt result = attemptService.submitAttempt(attemptId);
        log.info("Attempt {} submitted, score: {}%, status: {}", attemptId,
                String.format("%.1f", result.getScore()), result.getStatus());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<TestAttempt> getAttempt(@PathVariable String attemptId) {
        log.debug("Fetching attempt: {}", attemptId);
        return ResponseEntity.ok(attemptService.getAttemptById(attemptId));
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<List<TestAttempt>> getMyAttempts(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.debug("Fetching attempts for user: {}", user.getId());
        return ResponseEntity.ok(attemptService.getUserAttempts(user.getId()));
    }

    @GetMapping("/{id}/attempts-info")
    public ResponseEntity<Map<String, Object>> getAttemptsInfo(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = testService.getTestById(id);
        long completedAttempts = attemptService.getCompletedAttemptsCount(user.getId(), id);
        int maxAttempts = test.getMaxAttempts() != null ? test.getMaxAttempts() : 3;

        log.debug("Attempts info for user {} on test {}: {}/{}", user.getId(), id, completedAttempts, maxAttempts);

        Map<String, Object> info = new HashMap<>();
        info.put("completedAttempts", completedAttempts);
        info.put("maxAttempts", maxAttempts);
        info.put("canStart", completedAttempts < maxAttempts);
        return ResponseEntity.ok(info);
    }
}
