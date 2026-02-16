package com.quizsystem.controller;

import com.quizsystem.model.Course;
import com.quizsystem.model.Test;
import com.quizsystem.service.CourseService;
import com.quizsystem.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
