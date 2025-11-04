package com.quizsystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "test_attempts")
public class TestAttempt {

    @Id
    private String id;

    private String testId;

    private String userId;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private AttemptStatus status;

    private List<Answer> answers;

    private Double score;

    private Integer totalPoints;

    private Integer earnedPoints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Answer {
        private String questionId;
        private List<String> selectedChoices; 
        private String textAnswer; 
        private String numericAnswer; 
        private Boolean isCorrect;
        private Integer pointsAwarded;
    }

    public enum AttemptStatus {
        IN_PROGRESS,
        SUBMITTED,
        GRADED
    }
}
