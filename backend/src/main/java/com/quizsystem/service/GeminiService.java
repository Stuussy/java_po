package com.quizsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizsystem.dto.AIGenerateRequest;
import com.quizsystem.model.Test;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Test generateTest(AIGenerateRequest request) {
        if (!isConfigured()) {
            throw new RuntimeException("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String prompt = buildPrompt(request);

        String responseText = callGeminiAPI(prompt);

        return parseTestFromResponse(responseText, request);
    }

    private String buildPrompt(AIGenerateRequest request) {
        String lang = request.getLanguage() != null ? request.getLanguage() : "en";
        String langInstruction;
        switch (lang) {
            case "ru":
                langInstruction = "Generate ALL content (questions, choices, answers) in RUSSIAN language.";
                break;
            case "kz":
                langInstruction = "Generate ALL content (questions, choices, answers) in KAZAKH language.";
                break;
            default:
                langInstruction = "Generate ALL content (questions, choices, answers) in ENGLISH language.";
                break;
        }

        String questionTypesInstruction = "";
        if (request.getQuestionTypes() != null && !request.getQuestionTypes().isBlank()) {
            questionTypesInstruction = "Use ONLY these question types: " + request.getQuestionTypes() + ". ";
        } else {
            questionTypesInstruction = "Use a mix of these question types: SINGLE (single choice), MULTIPLE (multiple correct answers), TRUEFALSE (true/false). ";
        }

        return String.format("""
                You are a test/quiz generator for an educational platform.
                Generate a quiz test on the topic: "%s"

                Requirements:
                - Generate exactly %d questions
                - Difficulty level: %s
                - %s
                - %s

                IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no code blocks, no extra text.
                The JSON must follow this exact structure:
                {
                  "title": "Test title",
                  "description": "Brief test description",
                  "category": "Category name",
                  "questions": [
                    {
                      "type": "SINGLE",
                      "text": "Question text?",
                      "points": 1,
                      "choices": [
                        {"text": "Choice 1", "isCorrect": false},
                        {"text": "Choice 2", "isCorrect": true},
                        {"text": "Choice 3", "isCorrect": false},
                        {"text": "Choice 4", "isCorrect": false}
                      ]
                    },
                    {
                      "type": "MULTIPLE",
                      "text": "Question text?",
                      "points": 2,
                      "choices": [
                        {"text": "Choice 1", "isCorrect": true},
                        {"text": "Choice 2", "isCorrect": false},
                        {"text": "Choice 3", "isCorrect": true},
                        {"text": "Choice 4", "isCorrect": false}
                      ]
                    },
                    {
                      "type": "TRUEFALSE",
                      "text": "Statement that is true or false?",
                      "points": 1,
                      "choices": [
                        {"text": "True", "isCorrect": true},
                        {"text": "False", "isCorrect": false}
                      ]
                    }
                  ]
                }

                Rules:
                - Each SINGLE choice question must have exactly one correct answer
                - Each MULTIPLE choice question must have 2 or more correct answers
                - Each TRUEFALSE question must have exactly 2 choices: True and False
                - All questions must be accurate and factually correct
                - Points: SINGLE=1, MULTIPLE=2, TRUEFALSE=1
                - Each question must have 3-5 choices (except TRUEFALSE which has exactly 2)
                """,
                request.getTopic(),
                request.getNumberOfQuestions() != null ? request.getNumberOfQuestions() : 5,
                request.getDifficulty() != null ? request.getDifficulty() : "INTERMEDIATE",
                langInstruction,
                questionTypesInstruction
        );
    }

    private String callGeminiAPI(String prompt) {
        String url = apiUrl + "?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 8192);
        requestBody.put("generationConfig", generationConfig);

        try {
            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }

            throw new RuntimeException("Empty response from Gemini API");
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate test with AI: " + e.getMessage());
        }
    }

    private Test parseTestFromResponse(String responseText, AIGenerateRequest request) {
        try {
            String jsonStr = responseText.trim();
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.substring(7);
            }
            if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
            }
            jsonStr = jsonStr.trim();

            JsonNode rootNode = objectMapper.readTree(jsonStr);

            Test test = new Test();
            test.setTitle(rootNode.path("title").asText("AI Generated Test"));
            test.setDescription(rootNode.path("description").asText(""));
            test.setCategory(rootNode.path("category").asText(request.getTopic()));
            test.setDifficulty(parseDifficulty(request.getDifficulty()));
            test.setDurationMinutes(calculateDuration(request.getNumberOfQuestions()));
            test.setPassingScore(70);
            test.setPublished(false);
            test.setTags(List.of("AI Generated", request.getTopic()));

            List<Test.Question> questions = new ArrayList<>();
            JsonNode questionsNode = rootNode.path("questions");
            if (questionsNode.isArray()) {
                for (JsonNode qNode : questionsNode) {
                    Test.Question question = new Test.Question();
                    question.setId(UUID.randomUUID().toString());
                    question.setType(parseQuestionType(qNode.path("type").asText("SINGLE")));
                    question.setText(qNode.path("text").asText(""));
                    question.setPoints(qNode.path("points").asInt(1));

                    List<Test.Choice> choices = new ArrayList<>();
                    JsonNode choicesNode = qNode.path("choices");
                    if (choicesNode.isArray()) {
                        for (JsonNode cNode : choicesNode) {
                            Test.Choice choice = new Test.Choice();
                            choice.setId(UUID.randomUUID().toString());
                            choice.setText(cNode.path("text").asText(""));
                            choice.setIsCorrect(cNode.path("isCorrect").asBoolean(false));
                            choices.add(choice);
                        }
                    }
                    question.setChoices(choices);

                    if (qNode.has("correctAnswer")) {
                        question.setCorrectAnswer(qNode.path("correctAnswer").asText());
                    }

                    questions.add(question);
                }
            }

            test.setQuestions(questions);
            return test;

        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to parse AI-generated test. Please try again.");
        }
    }

    private Test.DifficultyLevel parseDifficulty(String difficulty) {
        if (difficulty == null) return Test.DifficultyLevel.INTERMEDIATE;
        try {
            return Test.DifficultyLevel.valueOf(difficulty.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Test.DifficultyLevel.INTERMEDIATE;
        }
    }

    private Test.QuestionType parseQuestionType(String type) {
        try {
            return Test.QuestionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Test.QuestionType.SINGLE;
        }
    }

    private Integer calculateDuration(Integer numberOfQuestions) {
        int questions = numberOfQuestions != null ? numberOfQuestions : 5;
        return Math.max(10, questions * 2);
    }
}
