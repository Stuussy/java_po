package com.quizsystem.controller;

import com.quizsystem.dto.AIGenerateRequest;
import com.quizsystem.dto.UserResponse;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.AIService;
import com.quizsystem.service.TestAttemptService;
import com.quizsystem.service.TestService;
import com.quizsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final TestService testService;
    private final UserService userService;
    private final TestAttemptService attemptService;
    private final UserRepository userRepository;
    private final AIService aiService;

    
    @GetMapping("/tests")
    public ResponseEntity<List<Test>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }

    @PostMapping("/tests")
    public ResponseEntity<Test> createTest(@RequestBody Test test, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(testService.createTest(test, user.getId()));
    }

    @PutMapping("/tests/{id}")
    public ResponseEntity<Test> updateTest(@PathVariable String id, @RequestBody Test test) {
        return ResponseEntity.ok(testService.updateTest(id, test));
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable String id) {
        testService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }

    
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> roleRequest) {
        User.UserRole role = User.UserRole.valueOf(roleRequest.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    
    @GetMapping("/reports/test/{id}")
    public ResponseEntity<Map<String, Object>> getTestReport(@PathVariable String id) {
        Test test = testService.getTestById(id);
        List<TestAttempt> attempts = attemptService.getTestAttempts(id);

        Map<String, Object> report = new HashMap<>();
        report.put("test", test);
        report.put("totalAttempts", attempts.size());

        if (!attempts.isEmpty()) {
            double avgScore = attempts.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(TestAttempt::getScore)
                    .average()
                    .orElse(0.0);

            long passed = attempts.stream()
                    .filter(a -> a.getScore() != null && a.getScore() >= test.getPassingScore())
                    .count();

            report.put("averageScore", avgScore);
            report.put("passedCount", passed);
            report.put("passRate", (double) passed / attempts.size() * 100);
        }

        report.put("attempts", attempts);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<UserResponse> users = userService.getAllUsers();
        List<Test> tests = testService.getAllTests();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("totalTests", tests.size());
        stats.put("publishedTests", tests.stream().filter(Test::getPublished).count());

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/ai/generate")
    public ResponseEntity<?> generateTestWithAI(@RequestBody AIGenerateRequest request, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Test generatedTest = aiService.generateTest(request);
            generatedTest.setCreatedBy(user.getId());
            return ResponseEntity.ok(generatedTest);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/ai/generate-and-save")
    public ResponseEntity<?> generateAndSaveTestWithAI(@RequestBody AIGenerateRequest request, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Test generatedTest = aiService.generateTest(request);
            Test savedTest = testService.createTest(generatedTest, user.getId());
            return ResponseEntity.ok(savedTest);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/ai/status")
    public ResponseEntity<Map<String, Boolean>> getAIStatus() {
        Map<String, Boolean> status = new HashMap<>();
        status.put("configured", aiService.isConfigured());
        return ResponseEntity.ok(status);
    }
}
