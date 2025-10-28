package com.quizsystem.service;

import com.quizsystem.model.Test;
import com.quizsystem.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestRepository testRepository;

    public List<Test> getAllPublishedTests() {
        return testRepository.findByPublishedTrue();
    }

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public Test getTestById(String id) {
        return testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public Test createTest(Test test, String createdBy) {
        test.setCreatedBy(createdBy);
        test.setCreatedAt(LocalDateTime.now());
        test.setPublished(false);

        // Assign unique IDs to questions and choices
        if (test.getQuestions() != null) {
            test.getQuestions().forEach(question -> {
                if (question.getId() == null) {
                    question.setId(UUID.randomUUID().toString());
                }
                if (question.getChoices() != null) {
                    question.getChoices().forEach(choice -> {
                        if (choice.getId() == null) {
                            choice.setId(UUID.randomUUID().toString());
                        }
                    });
                }
            });
        }

        return testRepository.save(test);
    }

    public Test updateTest(String id, Test test) {
        Test existingTest = getTestById(id);

        existingTest.setTitle(test.getTitle());
        existingTest.setDescription(test.getDescription());
        existingTest.setDurationMinutes(test.getDurationMinutes());
        existingTest.setPassingScore(test.getPassingScore());
        existingTest.setTags(test.getTags());
        existingTest.setPublished(test.getPublished());
        existingTest.setQuestions(test.getQuestions());

        // Assign IDs to new questions/choices if needed
        if (existingTest.getQuestions() != null) {
            existingTest.getQuestions().forEach(question -> {
                if (question.getId() == null) {
                    question.setId(UUID.randomUUID().toString());
                }
                if (question.getChoices() != null) {
                    question.getChoices().forEach(choice -> {
                        if (choice.getId() == null) {
                            choice.setId(UUID.randomUUID().toString());
                        }
                    });
                }
            });
        }

        return testRepository.save(existingTest);
    }

    public void deleteTest(String id) {
        testRepository.deleteById(id);
    }

    public List<Test> searchTests(String query) {
        return testRepository.findByTitleContainingIgnoreCase(query);
    }
}
