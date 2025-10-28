package com.quizsystem.controller;

import com.quizsystem.dto.AnswerRequest;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.TestAttemptService;
import com.quizsystem.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final TestAttemptService attemptService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Test>> getAllPublishedTests() {
        return ResponseEntity.ok(testService.getAllPublishedTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable String id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Test>> searchTests(@RequestParam String query) {
        return ResponseEntity.ok(testService.searchTests(query));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<TestAttempt> startTest(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(attemptService.startAttempt(id, user.getId()));
    }

    @PostMapping("/{testId}/attempt/{attemptId}/answer")
    public ResponseEntity<TestAttempt> saveAnswer(
            @PathVariable String testId,
            @PathVariable String attemptId,
            @RequestBody AnswerRequest answerRequest) {
        return ResponseEntity.ok(attemptService.saveAnswer(attemptId, answerRequest));
    }

    @PostMapping("/{testId}/attempt/{attemptId}/submit")
    public ResponseEntity<TestAttempt> submitAttempt(
            @PathVariable String testId,
            @PathVariable String attemptId) {
        return ResponseEntity.ok(attemptService.submitAttempt(attemptId));
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<TestAttempt> getAttempt(@PathVariable String attemptId) {
        return ResponseEntity.ok(attemptService.getAttemptById(attemptId));
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<List<TestAttempt>> getMyAttempts(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(attemptService.getUserAttempts(user.getId()));
    }
}
