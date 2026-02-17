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
@Document(collection = "courses")
public class Course {

    @Id
    private String id;

    private String title;

    private String description;

    private String icon;

    private String color;

    private String category;

    private DifficultyLevel difficulty;

    private List<CourseModule> modules;

    private List<String> testIds;

    private Boolean published;

    @CreatedDate
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseModule {
        private String id;
        private String title;
        private String description;
        private String content;
        private Integer orderIndex;
        private List<String> testIds;
    }

    public enum DifficultyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED
    }
}
