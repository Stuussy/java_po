package com.quizsystem.repository;

import com.quizsystem.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {

    List<Course> findByPublishedTrue();

    List<Course> findByCategory(String category);

    List<Course> findByTitleContainingIgnoreCase(String title);
}
