package com.quizsystem.repository;

import com.quizsystem.model.CourseProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CourseProgressRepository extends MongoRepository<CourseProgress, String> {
    Optional<CourseProgress> findByUserIdAndCourseId(String userId, String courseId);
    List<CourseProgress> findByUserId(String userId);
    List<CourseProgress> findByUserIdAndCompletedTrue(String userId);
}
