package com.quizsystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tests")
public class Test {

    @Id
    private String id;

    private String title;

    private String description;

    private Integer durationMinutes;

    private Integer passingScore;

    private List<String> tags;

    private String category;

    private DifficultyLevel difficulty;

    private Boolean published;

    private List<Question> questions;

    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private QuestionType type;
        private String text;
        private List<Choice> choices;
        private Integer points;
        private String correctAnswer; // For open-ended and numeric questions
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Choice {
        private String id;
        private String text;
        private Boolean isCorrect;
    }

    public enum QuestionType {
        SINGLE,
        MULTIPLE,
        TRUEFALSE,
        OPEN,
        NUMERIC
    }

    public enum DifficultyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED
    }
}
