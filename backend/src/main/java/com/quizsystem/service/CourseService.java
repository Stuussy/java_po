package com.quizsystem.service;

import com.quizsystem.model.Course;
import com.quizsystem.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

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
}
