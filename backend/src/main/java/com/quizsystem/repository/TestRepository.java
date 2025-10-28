package com.quizsystem.repository;

import com.quizsystem.model.Test;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRepository extends MongoRepository<Test, String> {

    List<Test> findByPublishedTrue();

    List<Test> findByCreatedBy(String createdBy);

    List<Test> findByTagsContaining(String tag);

    List<Test> findByTitleContainingIgnoreCase(String title);
}
