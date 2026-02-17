package com.quizsystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "course_progress")
@CompoundIndex(name = "user_course_idx", def = "{'userId': 1, 'courseId': 1}", unique = true)
public class CourseProgress {

    @Id
    private String id;

    private String userId;

    private String courseId;

    @Builder.Default
    private List<String> completedModuleIds = new ArrayList<>();

    private Boolean completed;

    private LocalDateTime completedAt;

    private LocalDateTime updatedAt;
}
