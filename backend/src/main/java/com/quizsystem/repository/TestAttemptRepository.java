package com.quizsystem.repository;

import com.quizsystem.model.TestAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends MongoRepository<TestAttempt, String> {

    List<TestAttempt> findByUserId(String userId);

    List<TestAttempt> findByTestId(String testId);

    List<TestAttempt> findByUserIdAndTestId(String userId, String testId);

    List<TestAttempt> findByStatus(TestAttempt.AttemptStatus status);

    long countByTestId(String testId);

    long countByUserId(String userId);
}
