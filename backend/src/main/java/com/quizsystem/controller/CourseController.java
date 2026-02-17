package com.quizsystem.controller;

import com.quizsystem.model.Course;
import com.quizsystem.model.CourseProgress;
import com.quizsystem.model.Test;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.CourseService;
import com.quizsystem.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final TestService testService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Course>> getAllPublishedCourses() {
        return ResponseEntity.ok(courseService.getAllPublishedCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCourseById(@PathVariable String id) {
        Course course = courseService.getCourseById(id);

        List<Test> courseTests = new ArrayList<>();
        if (course.getTestIds() != null) {
            for (String testId : course.getTestIds()) {
                try {
                    courseTests.add(testService.getTestById(testId));
                } catch (Exception ignored) {}
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("course", course);
        response.put("tests", courseTests);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String query) {
        return ResponseEntity.ok(courseService.searchCourses(query));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<?> getCourseProgress(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CourseProgress progress = courseService.getProgress(user.getId(), id);
        if (progress == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("completedModuleIds", List.of());
            empty.put("completed", false);
            return ResponseEntity.ok(empty);
        }
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/{courseId}/modules/{moduleId}/complete")
    public ResponseEntity<CourseProgress> completeModule(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(courseService.completeModule(user.getId(), courseId, moduleId));
    }

    @GetMapping("/my-progress")
    public ResponseEntity<List<CourseProgress>> getMyProgress(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(courseService.getUserProgress(user.getId()));
    }

    @GetMapping("/my-completed")
    public ResponseEntity<List<CourseProgress>> getMyCompletedCourses(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(courseService.getCompletedCourses(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody Course course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
