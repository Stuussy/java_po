package com.quizsystem.service;

import com.quizsystem.model.Course;
import com.quizsystem.model.CourseProgress;
import com.quizsystem.repository.CourseProgressRepository;
import com.quizsystem.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseProgressRepository courseProgressRepository;

    public List<Course> getAllPublishedCourses() {
        return courseRepository.findByPublishedTrue();
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(Course course) {
        course.setCreatedAt(LocalDateTime.now());
        if (course.getPublished() == null) {
            course.setPublished(false);
        }
        if (course.getModules() != null) {
            course.getModules().forEach(module -> {
                if (module.getId() == null) {
                    module.setId(UUID.randomUUID().toString());
                }
            });
        }
        return courseRepository.save(course);
    }

    public Course updateCourse(String id, Course course) {
        Course existing = getCourseById(id);
        existing.setTitle(course.getTitle());
        existing.setDescription(course.getDescription());
        existing.setIcon(course.getIcon());
        existing.setColor(course.getColor());
        existing.setCategory(course.getCategory());
        existing.setDifficulty(course.getDifficulty());
        existing.setModules(course.getModules());
        existing.setTestIds(course.getTestIds());
        existing.setPublished(course.getPublished());
        return courseRepository.save(existing);
    }

    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContainingIgnoreCase(query);
    }

    public CourseProgress getProgress(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElse(null);
    }

    public List<CourseProgress> getUserProgress(String userId) {
        return courseProgressRepository.findByUserId(userId);
    }

    public List<CourseProgress> getCompletedCourses(String userId) {
        return courseProgressRepository.findByUserIdAndCompletedTrue(userId);
    }

    public CourseProgress completeModule(String userId, String courseId, String moduleId) {
        Course course = getCourseById(courseId);

        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElse(CourseProgress.builder()
                        .userId(userId)
                        .courseId(courseId)
                        .completedModuleIds(new ArrayList<>())
                        .completed(false)
                        .build());

        if (!progress.getCompletedModuleIds().contains(moduleId)) {
            progress.getCompletedModuleIds().add(moduleId);
        }

        if (course.getModules() != null) {
            boolean allDone = course.getModules().stream()
                    .allMatch(m -> progress.getCompletedModuleIds().contains(m.getId()));
            if (allDone && !Boolean.TRUE.equals(progress.getCompleted())) {
                progress.setCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
            }
        }

        progress.setUpdatedAt(LocalDateTime.now());
        return courseProgressRepository.save(progress);
    }
}
