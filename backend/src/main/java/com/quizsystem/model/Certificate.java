package com.quizsystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "certificates")
public class Certificate {

    @Id
    private String id;

    @Indexed
    private String attemptId;

    @Indexed
    private String userId;

    private String testId;

    private String studentName;

    private String testTitle;

    private Double score;

    private String verificationCode;

    private LocalDateTime issuedAt;
}
