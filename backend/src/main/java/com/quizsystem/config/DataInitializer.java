package com.quizsystem.config;

import com.quizsystem.model.Course;
import com.quizsystem.model.Test;
import com.quizsystem.model.User;
import com.quizsystem.repository.CourseRepository;
import com.quizsystem.repository.TestRepository;
import com.quizsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (!userRepository.existsByEmail("admin@quiz.com")) {
            User admin = User.builder()
                    .email("admin@quiz.com")
                    .name("Admin User")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(User.UserRole.ADMIN)
                    .organization("Quiz System")
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created:");
            log.info("Email: admin@quiz.com");
            log.info("Password: admin123");
        }

        
        if (!userRepository.existsByEmail("user@quiz.com")) {
            User user = User.builder()
                    .email("user@quiz.com")
                    .name("Test User")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .role(User.UserRole.USER)
                    .organization("Quiz System")
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
            log.info("Default test user created:");
            log.info("Email: user@quiz.com");
            log.info("Password: user123");
        }

        
        User admin = userRepository.findByEmail("admin@quiz.com").orElse(null);
        if (admin != null) {
            createDefaultTests(admin.getId());
            createDefaultCourses();
        }
    }

    private void createDefaultTests(String adminId) {
        
        if (testRepository.count() > 0) {
            log.info("Tests already exist, skipping creation");
            return;
        }

        log.info("Creating default tests...");

        
        createJavaScriptTest(adminId);

        
        createReactTest(adminId);

        
        createSpringBootTest(adminId);

        
        createGeneralProgrammingTest(adminId);

        
        createDatabaseTest(adminId);

        log.info("Default tests created successfully!");
    }

    private void createJavaScriptTest(String adminId) {
        List<Test.Question> questions = new ArrayList<>();

        
        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is the correct way to declare a variable in JavaScript?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("var x = 5;").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("variable x = 5;").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("v x = 5;").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("x := 5;").isCorrect(false).build()
                ))
                .build());

        
        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.MULTIPLE)
                .text("Which of the following are JavaScript data types? (Select all that apply)")
                .points(2)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("String").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Number").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Boolean").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Character").isCorrect(false).build()
                ))
                .build());

        
        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.TRUEFALSE)
                .text("JavaScript is case-sensitive")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("True").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("False").isCorrect(false).build()
                ))
                .build());

        
        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What does '===' operator do in JavaScript?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Compares values and types").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Compares only values").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Assigns value").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Compares references").isCorrect(false).build()
                ))
                .build());

        
        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.NUMERIC)
                .text("What is the result of: 2 + 2 * 2 in JavaScript?")
                .points(1)
                .correctAnswer("6")
                .build());

        Test test = Test.builder()
                .title("JavaScript Basics")
                .description("Test your knowledge of fundamental JavaScript concepts including variables, data types, operators, and syntax.")
                .durationMinutes(15)
                .passingScore(70)
                .tags(Arrays.asList("JavaScript", "Programming", "Beginner"))
                .category("Programming")
                .difficulty(Test.DifficultyLevel.BEGINNER)
                .published(true)
                .questions(questions)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        testRepository.save(test);
        log.info("Created: JavaScript Basics test");
    }

    private void createReactTest(String adminId) {
        List<Test.Question> questions = new ArrayList<>();

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is React?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A JavaScript library for building user interfaces").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A database management system").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A programming language").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A CSS framework").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.MULTIPLE)
                .text("Which of the following are React Hooks? (Select all that apply)")
                .points(2)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("useState").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("useEffect").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("useContext").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("useComponent").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.TRUEFALSE)
                .text("In React, props are mutable")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("True").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("False").isCorrect(true).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is JSX?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("JavaScript XML - syntax extension for JavaScript").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A new programming language").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A CSS preprocessor").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A testing framework").isCorrect(false).build()
                ))
                .build());

        Test test = Test.builder()
                .title("React Fundamentals")
                .description("Master the fundamentals of React including components, hooks, props, state management, and JSX syntax.")
                .durationMinutes(20)
                .passingScore(75)
                .tags(Arrays.asList("React", "JavaScript", "Frontend", "Intermediate"))
                .category("Frontend")
                .difficulty(Test.DifficultyLevel.INTERMEDIATE)
                .published(true)
                .questions(questions)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        testRepository.save(test);
        log.info("Created: React Fundamentals test");
    }

    private void createSpringBootTest(String adminId) {
        List<Test.Question> questions = new ArrayList<>();

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is Spring Boot?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Framework for creating stand-alone Spring applications").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A frontend framework").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("A database system").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("An IDE for Java").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.MULTIPLE)
                .text("Which annotations are used in Spring Boot? (Select all that apply)")
                .points(2)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("@SpringBootApplication").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("@RestController").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("@Service").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("@Component").isCorrect(true).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.TRUEFALSE)
                .text("Spring Boot requires manual configuration for most features")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("True").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("False").isCorrect(true).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is the default port for Spring Boot applications?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("8080").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("3000").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("80").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("8888").isCorrect(false).build()
                ))
                .build());

        Test test = Test.builder()
                .title("Java Spring Boot Essentials")
                .description("Learn the essentials of Spring Boot framework, including annotations, dependency injection, REST APIs, and configuration.")
                .durationMinutes(25)
                .passingScore(70)
                .tags(Arrays.asList("Java", "Spring Boot", "Backend", "Intermediate"))
                .category("Backend")
                .difficulty(Test.DifficultyLevel.INTERMEDIATE)
                .published(true)
                .questions(questions)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        testRepository.save(test);
        log.info("Created: Java Spring Boot Essentials test");
    }

    private void createGeneralProgrammingTest(String adminId) {
        List<Test.Question> questions = new ArrayList<>();

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is OOP?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Object-Oriented Programming").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Open Operating Platform").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Optimized Object Processing").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Online Operation Protocol").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.MULTIPLE)
                .text("Which are principles of OOP? (Select all that apply)")
                .points(2)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Encapsulation").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Inheritance").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Polymorphism").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Compilation").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.TRUEFALSE)
                .text("An algorithm is a step-by-step procedure for solving a problem")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("True").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("False").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What does API stand for?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Application Programming Interface").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Advanced Programming Integration").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Automated Process Implementation").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Application Process Interface").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("Which data structure follows LIFO (Last In First Out)?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Stack").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Queue").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Array").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Linked List").isCorrect(false).build()
                ))
                .build());

        Test test = Test.builder()
                .title("General Programming Concepts")
                .description("Test your understanding of core programming concepts including OOP principles, data structures, algorithms, and software design patterns.")
                .durationMinutes(20)
                .passingScore(70)
                .tags(Arrays.asList("Programming", "Computer Science", "Beginner"))
                .category("Computer Science")
                .difficulty(Test.DifficultyLevel.BEGINNER)
                .published(true)
                .questions(questions)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        testRepository.save(test);
        log.info("Created: General Programming Concepts test");
    }

    private void createDatabaseTest(String adminId) {
        List<Test.Question> questions = new ArrayList<>();

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What does SQL stand for?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Structured Query Language").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Simple Query Language").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("System Query Language").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Standard Query Language").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.MULTIPLE)
                .text("Which are valid SQL commands? (Select all that apply)")
                .points(2)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("SELECT").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("INSERT").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("UPDATE").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("MODIFY").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.TRUEFALSE)
                .text("Primary key must be unique for each row")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("True").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("False").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("What is MongoDB?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("NoSQL document database").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Relational database").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Programming language").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("Web framework").isCorrect(false).build()
                ))
                .build());

        questions.add(Test.Question.builder()
                .id(UUID.randomUUID().toString())
                .type(Test.QuestionType.SINGLE)
                .text("Which SQL clause is used to filter results?")
                .points(1)
                .choices(Arrays.asList(
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("WHERE").isCorrect(true).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("FILTER").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("HAVING").isCorrect(false).build(),
                        Test.Choice.builder().id(UUID.randomUUID().toString()).text("LIMIT").isCorrect(false).build()
                ))
                .build());

        Test test = Test.builder()
                .title("Database & SQL Fundamentals")
                .description("Explore database concepts, SQL queries, NoSQL databases, data modeling, and database design principles.")
                .durationMinutes(20)
                .passingScore(70)
                .tags(Arrays.asList("Database", "SQL", "MongoDB", "Beginner"))
                .category("Database")
                .difficulty(Test.DifficultyLevel.BEGINNER)
                .published(true)
                .questions(questions)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        testRepository.save(test);
        log.info("Created: Database & SQL Fundamentals test");
    }

    private void createDefaultCourses() {
        if (courseRepository.count() > 0) {
            log.info("Courses already exist, skipping creation");
            return;
        }

        log.info("Creating default courses...");

        List<String> testIds = testRepository.findAll().stream()
                .map(Test::getId)
                .toList();

        // Python Course
        courseRepository.save(Course.builder()
                .title("Python")
                .description("Learn Python from scratch - the most popular programming language for beginners and professionals. Covers basics, OOP, data structures, and web development.")
                .icon("python")
                .color("#3776AB")
                .category("Programming")
                .difficulty(Course.DifficultyLevel.BEGINNER)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Introduction to Python").description("Variables, data types, operators").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Control Flow").description("Conditionals, loops, functions").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Data Structures").description("Lists, dictionaries, sets, tuples").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP in Python").description("Classes, inheritance, polymorphism").orderIndex(4).build()
                ))
                .testIds(testIds.isEmpty() ? List.of() : List.of(testIds.get(0)))
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        // Java Course
        courseRepository.save(Course.builder()
                .title("Java")
                .description("Master Java - a robust, object-oriented language used in enterprise development, Android apps, and backend systems. Spring Boot included.")
                .icon("java")
                .color("#ED8B00")
                .category("Programming")
                .difficulty(Course.DifficultyLevel.INTERMEDIATE)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Java Basics").description("Syntax, variables, operators").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP Concepts").description("Classes, interfaces, abstract classes").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Collections Framework").description("Lists, Maps, Sets, Streams").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Spring Boot").description("REST APIs, dependency injection, MVC").orderIndex(4).build()
                ))
                .testIds(testIds.size() > 2 ? List.of(testIds.get(2)) : List.of())
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        // JavaScript Course
        courseRepository.save(Course.builder()
                .title("JavaScript")
                .description("Learn JavaScript - the language of the web. Build interactive websites, modern web applications, and server-side programs with Node.js.")
                .icon("javascript")
                .color("#F7DF1E")
                .category("Programming")
                .difficulty(Course.DifficultyLevel.BEGINNER)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("JavaScript Fundamentals").description("Variables, types, functions").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("DOM Manipulation").description("Selectors, events, dynamic content").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Async JavaScript").description("Promises, async/await, fetch API").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("ES6+ Features").description("Arrow functions, destructuring, modules").orderIndex(4).build()
                ))
                .testIds(testIds.isEmpty() ? List.of() : List.of(testIds.get(0)))
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        // React Course
        courseRepository.save(Course.builder()
                .title("React")
                .description("Build modern user interfaces with React. Learn components, hooks, state management, routing, and best practices for production apps.")
                .icon("react")
                .color("#61DAFB")
                .category("Frontend")
                .difficulty(Course.DifficultyLevel.INTERMEDIATE)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("React Basics").description("Components, JSX, props").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("State & Hooks").description("useState, useEffect, custom hooks").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Routing & Navigation").description("React Router, navigation patterns").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Advanced Patterns").description("Context, reducers, performance").orderIndex(4).build()
                ))
                .testIds(testIds.size() > 1 ? List.of(testIds.get(1)) : List.of())
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        // SQL & Databases Course
        courseRepository.save(Course.builder()
                .title("SQL & Databases")
                .description("Master database concepts and SQL. Learn relational and NoSQL databases, queries, optimization, and data modeling for real projects.")
                .icon("database")
                .color("#336791")
                .category("Database")
                .difficulty(Course.DifficultyLevel.BEGINNER)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Database Fundamentals").description("Tables, schemas, relationships").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("SQL Queries").description("SELECT, INSERT, UPDATE, DELETE, JOIN").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("NoSQL Databases").description("MongoDB, document model").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Database Design").description("Normalization, indexing, optimization").orderIndex(4).build()
                ))
                .testIds(testIds.size() > 4 ? List.of(testIds.get(4)) : List.of())
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        // C++ Course
        courseRepository.save(Course.builder()
                .title("C++")
                .description("Learn C++ for high-performance systems programming. Covers memory management, pointers, templates, STL, and modern C++ features.")
                .icon("cplusplus")
                .color("#00599C")
                .category("Programming")
                .difficulty(Course.DifficultyLevel.ADVANCED)
                .modules(Arrays.asList(
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("C++ Basics").description("Syntax, variables, I/O").orderIndex(1).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Pointers & Memory").description("Pointers, references, dynamic memory").orderIndex(2).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP in C++").description("Classes, inheritance, virtual functions").orderIndex(3).build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("STL & Templates").description("Containers, algorithms, iterators").orderIndex(4).build()
                ))
                .testIds(List.of())
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        log.info("Default courses created successfully!");
    }
}
