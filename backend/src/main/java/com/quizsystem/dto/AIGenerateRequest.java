package com.quizsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateRequest {

    private String topic;

    private Integer numberOfQuestions;

    private String difficulty;

    private String language;

    private String questionTypes;
}
