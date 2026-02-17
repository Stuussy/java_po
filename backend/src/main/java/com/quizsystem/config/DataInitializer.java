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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Introduction to Python").description("Variables, data types, operators").orderIndex(1)
                                .content("## Introduction to Python\n\nPython is a high-level, interpreted programming language known for its simplicity and readability.\n\n### Variables\nIn Python, you don't need to declare a variable type. The type is determined automatically:\n```python\nname = \"Alice\"    # String\nage = 25           # Integer\nheight = 1.75      # Float\nis_student = True   # Boolean\n```\n\n### Data Types\nPython has several built-in data types:\n- **str** — text strings: `\"Hello, World!\"`\n- **int** — integers: `42`\n- **float** — decimal numbers: `3.14`\n- **bool** — boolean values: `True` or `False`\n- **NoneType** — absence of value: `None`\n\n### Operators\n- Arithmetic: `+`, `-`, `*`, `/`, `//` (floor division), `%` (modulo), `**` (power)\n- Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`\n- Logical: `and`, `or`, `not`\n\n### Example\n```python\nx = 10\ny = 3\nprint(x + y)   # 13\nprint(x ** y)  # 1000\nprint(x > y)   # True\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Control Flow").description("Conditionals, loops, functions").orderIndex(2)
                                .content("## Control Flow in Python\n\n### Conditional Statements\nUse `if`, `elif`, and `else` to make decisions:\n```python\nage = 18\nif age >= 18:\n    print(\"Adult\")\nelif age >= 13:\n    print(\"Teenager\")\nelse:\n    print(\"Child\")\n```\n\n### Loops\n**for loop** — iterates over a sequence:\n```python\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfor fruit in fruits:\n    print(fruit)\n```\n\n**while loop** — repeats while a condition is true:\n```python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n```\n\n### Functions\nFunctions help organize and reuse code:\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n\ndef calculate_area(width, height):\n    return width * height\n\nprint(greet(\"Alice\"))           # Hello, Alice!\nprint(calculate_area(5, 3))     # 15\n```\n\n### Lambda Functions\nShort anonymous functions:\n```python\nsquare = lambda x: x ** 2\nprint(square(4))  # 16\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Data Structures").description("Lists, dictionaries, sets, tuples").orderIndex(3)
                                .content("## Data Structures in Python\n\n### Lists\nOrdered, mutable collections:\n```python\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfruits.append(\"date\")      # Add element\nfruits.remove(\"banana\")    # Remove element\nprint(fruits[0])           # \"apple\"\nprint(len(fruits))         # 3\n```\n\n### Dictionaries\nKey-value pairs:\n```python\nstudent = {\n    \"name\": \"Alice\",\n    \"age\": 20,\n    \"grades\": [90, 85, 92]\n}\nprint(student[\"name\"])     # \"Alice\"\nstudent[\"email\"] = \"alice@mail.com\"  # Add new key\n```\n\n### Tuples\nOrdered, immutable collections:\n```python\ncoordinates = (10.0, 20.0)\nx, y = coordinates  # Unpacking\nprint(x)  # 10.0\n```\n\n### Sets\nUnordered collections of unique elements:\n```python\ncolors = {\"red\", \"green\", \"blue\"}\ncolors.add(\"yellow\")\ncolors.add(\"red\")  # No duplicate\nprint(len(colors))  # 4\n```\n\n### List Comprehensions\n```python\nsquares = [x**2 for x in range(10)]\neven = [x for x in range(20) if x % 2 == 0]\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP in Python").description("Classes, inheritance, polymorphism").orderIndex(4)
                                .content("## Object-Oriented Programming in Python\n\n### Classes and Objects\nA class is a blueprint for creating objects:\n```python\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n    \n    def bark(self):\n        return f\"{self.name} says: Woof!\"\n\nmy_dog = Dog(\"Rex\", \"Labrador\")\nprint(my_dog.bark())  # Rex says: Woof!\n```\n\n### Inheritance\nCreate new classes based on existing ones:\n```python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        pass\n\nclass Cat(Animal):\n    def speak(self):\n        return f\"{self.name}: Meow!\"\n\nclass Dog(Animal):\n    def speak(self):\n        return f\"{self.name}: Woof!\"\n```\n\n### Encapsulation\nProtect data with private attributes:\n```python\nclass BankAccount:\n    def __init__(self, balance):\n        self.__balance = balance  # Private\n    \n    def deposit(self, amount):\n        self.__balance += amount\n    \n    def get_balance(self):\n        return self.__balance\n```\n\n### Polymorphism\nDifferent classes can implement the same interface:\n```python\nanimals = [Cat(\"Whiskers\"), Dog(\"Rex\")]\nfor animal in animals:\n    print(animal.speak())\n```")
                                .build()
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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Java Basics").description("Syntax, variables, operators").orderIndex(1)
                                .content("## Java Basics\n\nJava is a statically-typed, object-oriented language that runs on the JVM (Java Virtual Machine).\n\n### Hello World\n```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n```\n\n### Variables and Data Types\nJava requires explicit type declaration:\n```java\nint age = 25;\ndouble price = 19.99;\nString name = \"Alice\";\nboolean isActive = true;\nchar grade = 'A';\n```\n\n### Primitive Types\n- `byte` (8 bit), `short` (16 bit), `int` (32 bit), `long` (64 bit)\n- `float` (32 bit), `double` (64 bit)\n- `boolean` — `true`/`false`\n- `char` — single character\n\n### Operators\n```java\nint a = 10, b = 3;\nSystem.out.println(a + b);   // 13\nSystem.out.println(a / b);   // 3 (integer division)\nSystem.out.println(a % b);   // 1\nSystem.out.println(a == b);  // false\n```\n\n### Input/Output\n```java\nimport java.util.Scanner;\nScanner scanner = new Scanner(System.in);\nString input = scanner.nextLine();\nint number = scanner.nextInt();\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP Concepts").description("Classes, interfaces, abstract classes").orderIndex(2)
                                .content("## OOP Concepts in Java\n\n### Classes and Objects\n```java\npublic class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    public String getName() { return name; }\n    public int getAge() { return age; }\n}\n\nStudent s = new Student(\"Alice\", 20);\n```\n\n### Inheritance\n```java\npublic class Animal {\n    protected String name;\n    public void speak() {\n        System.out.println(\"...\");\n    }\n}\n\npublic class Dog extends Animal {\n    @Override\n    public void speak() {\n        System.out.println(name + \" barks!\");\n    }\n}\n```\n\n### Interfaces\nDefine contracts that classes must follow:\n```java\npublic interface Drawable {\n    void draw();\n    double getArea();\n}\n\npublic class Circle implements Drawable {\n    private double radius;\n    \n    public void draw() { /* ... */ }\n    public double getArea() {\n        return Math.PI * radius * radius;\n    }\n}\n```\n\n### Abstract Classes\n```java\npublic abstract class Shape {\n    abstract double area();\n    \n    public void display() {\n        System.out.println(\"Area: \" + area());\n    }\n}\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Collections Framework").description("Lists, Maps, Sets, Streams").orderIndex(3)
                                .content("## Java Collections Framework\n\nCollections provide data structures for storing and manipulating groups of objects.\n\n### List — Ordered collection\n```java\nList<String> names = new ArrayList<>();\nnames.add(\"Alice\");\nnames.add(\"Bob\");\nnames.get(0);       // \"Alice\"\nnames.size();       // 2\nnames.remove(\"Bob\");\n```\n\n### Map — Key-Value pairs\n```java\nMap<String, Integer> scores = new HashMap<>();\nscores.put(\"Alice\", 95);\nscores.put(\"Bob\", 87);\nint aliceScore = scores.get(\"Alice\"); // 95\nscores.containsKey(\"Bob\");  // true\n```\n\n### Set — Unique elements\n```java\nSet<String> colors = new HashSet<>();\ncolors.add(\"Red\");\ncolors.add(\"Blue\");\ncolors.add(\"Red\");  // Ignored\ncolors.size();      // 2\n```\n\n### Streams API (Java 8+)\nFunctional-style operations on collections:\n```java\nList<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);\n\nList<Integer> even = numbers.stream()\n    .filter(n -> n % 2 == 0)\n    .collect(Collectors.toList());\n\nint sum = numbers.stream()\n    .mapToInt(Integer::intValue)\n    .sum();\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Spring Boot").description("REST APIs, dependency injection, MVC").orderIndex(4)
                                .content("## Spring Boot\n\nSpring Boot simplifies building production-ready Java applications.\n\n### Project Structure\n```\nsrc/main/java/com/example/\n  Application.java          // Main class\n  controller/               // REST endpoints\n  service/                  // Business logic\n  model/                    // Data models\n  repository/               // Database access\nsrc/main/resources/\n  application.properties    // Configuration\n```\n\n### REST Controller\n```java\n@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    \n    @Autowired\n    private UserService userService;\n    \n    @GetMapping\n    public List<User> getAllUsers() {\n        return userService.findAll();\n    }\n    \n    @PostMapping\n    public User createUser(@RequestBody User user) {\n        return userService.save(user);\n    }\n}\n```\n\n### Dependency Injection\n```java\n@Service\npublic class UserService {\n    private final UserRepository repository;\n    \n    public UserService(UserRepository repository) {\n        this.repository = repository;\n    }\n}\n```\n\n### Key Annotations\n- `@SpringBootApplication` — main class\n- `@RestController` — REST API controller\n- `@Service` — business logic layer\n- `@Repository` — data access layer\n- `@Autowired` — dependency injection")
                                .build()
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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("JavaScript Fundamentals").description("Variables, types, functions").orderIndex(1)
                                .content("## JavaScript Fundamentals\n\nJavaScript is the programming language of the web, used in both frontend and backend development.\n\n### Variables\nThree ways to declare variables:\n```javascript\nvar name = \"Alice\";     // Function-scoped (old)\nlet age = 25;           // Block-scoped (modern)\nconst PI = 3.14159;     // Constant (cannot reassign)\n```\n\n### Data Types\n- **String**: `\"Hello\"` or `'Hello'` or `` `Hello` ``\n- **Number**: `42`, `3.14` (no separate int/float)\n- **Boolean**: `true`, `false`\n- **null**: intentional absence of value\n- **undefined**: variable declared but not assigned\n- **Object**: `{ key: value }`\n- **Array**: `[1, 2, 3]`\n\n### Functions\n```javascript\n// Function declaration\nfunction add(a, b) {\n    return a + b;\n}\n\n// Arrow function (ES6)\nconst multiply = (a, b) => a * b;\n\n// Function with default parameter\nfunction greet(name = \"World\") {\n    return `Hello, ${name}!`;\n}\n```\n\n### Type Conversion\n```javascript\nString(42);        // \"42\"\nNumber(\"42\");      // 42\nBoolean(0);        // false\nBoolean(\"\");       // false\nBoolean(\"hello\");  // true\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("DOM Manipulation").description("Selectors, events, dynamic content").orderIndex(2)
                                .content("## DOM Manipulation\n\nThe DOM (Document Object Model) is a tree representation of an HTML page that JavaScript can manipulate.\n\n### Selecting Elements\n```javascript\n// By ID\nconst title = document.getElementById('title');\n\n// By CSS selector\nconst btn = document.querySelector('.btn-primary');\n\n// All matching elements\nconst items = document.querySelectorAll('.list-item');\n```\n\n### Modifying Elements\n```javascript\n// Change text\nelement.textContent = 'New text';\nelement.innerHTML = '<strong>Bold</strong>';\n\n// Change styles\nelement.style.color = 'red';\nelement.style.fontSize = '20px';\n\n// Add/remove CSS classes\nelement.classList.add('active');\nelement.classList.remove('hidden');\nelement.classList.toggle('visible');\n```\n\n### Event Handling\n```javascript\nconst button = document.querySelector('#myButton');\n\nbutton.addEventListener('click', function(event) {\n    alert('Button clicked!');\n});\n\n// Common events: click, submit, keydown,\n// mouseover, change, load, scroll\n```\n\n### Creating Elements\n```javascript\nconst newDiv = document.createElement('div');\nnewDiv.textContent = 'Hello!';\nnewDiv.className = 'card';\ndocument.body.appendChild(newDiv);\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Async JavaScript").description("Promises, async/await, fetch API").orderIndex(3)
                                .content("## Asynchronous JavaScript\n\nAsync code allows operations to run without blocking the main thread.\n\n### Callbacks\nThe traditional approach:\n```javascript\nsetTimeout(() => {\n    console.log('Executed after 2 seconds');\n}, 2000);\n```\n\n### Promises\nA cleaner way to handle async operations:\n```javascript\nconst fetchData = new Promise((resolve, reject) => {\n    const success = true;\n    if (success) {\n        resolve('Data loaded');\n    } else {\n        reject('Error occurred');\n    }\n});\n\nfetchData\n    .then(data => console.log(data))\n    .catch(error => console.error(error));\n```\n\n### Async/Await\nModern syntax for working with promises:\n```javascript\nasync function getUser() {\n    try {\n        const response = await fetch('/api/user');\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error('Error:', error);\n    }\n}\n```\n\n### Fetch API\n```javascript\n// GET request\nconst response = await fetch('https://api.example.com/data');\nconst data = await response.json();\n\n// POST request\nawait fetch('/api/users', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ name: 'Alice' })\n});\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("ES6+ Features").description("Arrow functions, destructuring, modules").orderIndex(4)
                                .content("## ES6+ Features\n\nModern JavaScript features that make code cleaner.\n\n### Arrow Functions\n```javascript\n// Traditional\nfunction add(a, b) { return a + b; }\n\n// Arrow function\nconst add = (a, b) => a + b;\n\n// With array methods\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconst even = numbers.filter(n => n % 2 === 0);\n```\n\n### Destructuring\n```javascript\n// Object destructuring\nconst { name, age } = { name: 'Alice', age: 25 };\n\n// Array destructuring\nconst [first, second] = [10, 20];\n\n// In function parameters\nfunction display({ name, age }) {\n    console.log(`${name} is ${age}`);\n}\n```\n\n### Spread/Rest Operators\n```javascript\n// Spread\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1,2,3,4,5]\n\nconst obj1 = { a: 1 };\nconst obj2 = { ...obj1, b: 2 }; // {a:1, b:2}\n\n// Rest\nfunction sum(...numbers) {\n    return numbers.reduce((a, b) => a + b, 0);\n}\n```\n\n### Modules\n```javascript\n// export (math.js)\nexport const PI = 3.14;\nexport function add(a, b) { return a + b; }\n\n// import\nimport { PI, add } from './math.js';\nimport * as math from './math.js';\n```\n\n### Template Literals\n```javascript\nconst name = 'Alice';\nconst greeting = `Hello, ${name}!`;\nconst multiline = `\n    Line 1\n    Line 2\n`;\n```")
                                .build()
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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("React Basics").description("Components, JSX, props").orderIndex(1)
                                .content("## React Basics\n\nReact is a JavaScript library for building user interfaces using reusable components.\n\n### JSX\nJSX lets you write HTML-like syntax in JavaScript:\n```jsx\nconst element = <h1>Hello, World!</h1>;\n\nconst name = 'Alice';\nconst greeting = <p>Hello, {name}!</p>;\n```\n\n### Components\nFunction components are the modern way to build React UIs:\n```jsx\nfunction Welcome({ name }) {\n    return <h1>Hello, {name}!</h1>;\n}\n\n// Usage\n<Welcome name=\"Alice\" />\n```\n\n### Props\nProps pass data from parent to child:\n```jsx\nfunction UserCard({ name, email, role }) {\n    return (\n        <div className=\"card\">\n            <h2>{name}</h2>\n            <p>{email}</p>\n            <span>{role}</span>\n        </div>\n    );\n}\n\n<UserCard name=\"Alice\" email=\"alice@mail.com\" role=\"Admin\" />\n```\n\n### Conditional Rendering\n```jsx\nfunction Status({ isOnline }) {\n    return (\n        <span>\n            {isOnline ? 'Online' : 'Offline'}\n        </span>\n    );\n}\n```\n\n### Rendering Lists\n```jsx\nfunction TodoList({ items }) {\n    return (\n        <ul>\n            {items.map(item => (\n                <li key={item.id}>{item.text}</li>\n            ))}\n        </ul>\n    );\n}\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("State & Hooks").description("useState, useEffect, custom hooks").orderIndex(2)
                                .content("## State & Hooks\n\nHooks let you use state and other React features in function components.\n\n### useState\nManage component state:\n```jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    \n    return (\n        <div>\n            <p>Count: {count}</p>\n            <button onClick={() => setCount(count + 1)}>+</button>\n            <button onClick={() => setCount(count - 1)}>-</button>\n        </div>\n    );\n}\n```\n\n### useEffect\nPerform side effects (API calls, subscriptions):\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction UserProfile({ userId }) {\n    const [user, setUser] = useState(null);\n    \n    useEffect(() => {\n        fetch(`/api/users/${userId}`)\n            .then(res => res.json())\n            .then(data => setUser(data));\n    }, [userId]); // Runs when userId changes\n    \n    if (!user) return <p>Loading...</p>;\n    return <h1>{user.name}</h1>;\n}\n```\n\n### Custom Hooks\nExtract reusable logic:\n```jsx\nfunction useLocalStorage(key, initialValue) {\n    const [value, setValue] = useState(() => {\n        const saved = localStorage.getItem(key);\n        return saved ? JSON.parse(saved) : initialValue;\n    });\n    \n    useEffect(() => {\n        localStorage.setItem(key, JSON.stringify(value));\n    }, [key, value]);\n    \n    return [value, setValue];\n}\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Routing & Navigation").description("React Router, navigation patterns").orderIndex(3)
                                .content("## Routing & Navigation\n\nReact Router enables client-side navigation without page reloads.\n\n### Setup\n```jsx\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n    return (\n        <BrowserRouter>\n            <Routes>\n                <Route path=\"/\" element={<Home />} />\n                <Route path=\"/about\" element={<About />} />\n                <Route path=\"/users/:id\" element={<UserProfile />} />\n                <Route path=\"*\" element={<NotFound />} />\n            </Routes>\n        </BrowserRouter>\n    );\n}\n```\n\n### Navigation\n```jsx\nimport { Link, useNavigate } from 'react-router-dom';\n\nfunction Header() {\n    const navigate = useNavigate();\n    \n    return (\n        <nav>\n            <Link to=\"/\">Home</Link>\n            <Link to=\"/about\">About</Link>\n            <button onClick={() => navigate('/login')}>\n                Login\n            </button>\n        </nav>\n    );\n}\n```\n\n### URL Parameters\n```jsx\nimport { useParams } from 'react-router-dom';\n\nfunction UserProfile() {\n    const { id } = useParams();\n    // Use id to fetch user data\n    return <h1>User #{id}</h1>;\n}\n```\n\n### Protected Routes\n```jsx\nfunction PrivateRoute({ children }) {\n    const { user } = useAuth();\n    return user ? children : <Navigate to=\"/login\" />;\n}\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Advanced Patterns").description("Context, reducers, performance").orderIndex(4)
                                .content("## Advanced React Patterns\n\n### Context API\nShare data across the component tree without prop drilling:\n```jsx\nconst ThemeContext = React.createContext('light');\n\nfunction App() {\n    return (\n        <ThemeContext.Provider value=\"dark\">\n            <Header />\n            <Content />\n        </ThemeContext.Provider>\n    );\n}\n\nfunction Header() {\n    const theme = useContext(ThemeContext);\n    return <header className={theme}>...</header>;\n}\n```\n\n### useReducer\nFor complex state logic:\n```jsx\nfunction reducer(state, action) {\n    switch (action.type) {\n        case 'increment':\n            return { count: state.count + 1 };\n        case 'decrement':\n            return { count: state.count - 1 };\n        case 'reset':\n            return { count: 0 };\n        default:\n            return state;\n    }\n}\n\nfunction Counter() {\n    const [state, dispatch] = useReducer(reducer, { count: 0 });\n    return (\n        <div>\n            <p>{state.count}</p>\n            <button onClick={() => dispatch({ type: 'increment' })}>+</button>\n        </div>\n    );\n}\n```\n\n### Performance Optimization\n- **React.memo** — skip re-rendering if props haven't changed\n- **useMemo** — memoize expensive calculations\n- **useCallback** — memoize function references\n\n```jsx\nconst MemoizedComponent = React.memo(({ data }) => {\n    return <div>{data}</div>;\n});\n\nconst expensiveValue = useMemo(() => {\n    return computeExpensiveValue(input);\n}, [input]);\n```")
                                .build()
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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Database Fundamentals").description("Tables, schemas, relationships").orderIndex(1)
                                .content("## Database Fundamentals\n\nA database is an organized collection of structured data stored electronically.\n\n### Relational Databases\nData is organized in tables with rows and columns:\n```\nStudents Table:\n| id | name    | age | email           |\n|----|---------|-----|-----------------|\n| 1  | Alice   | 20  | alice@mail.com  |\n| 2  | Bob     | 22  | bob@mail.com    |\n```\n\n### Key Concepts\n- **Primary Key (PK)** — uniquely identifies each row (e.g., `id`)\n- **Foreign Key (FK)** — references a PK in another table\n- **Schema** — the structure/blueprint of a database\n- **Table** — a collection of related data in rows and columns\n\n### Relationships\n- **One-to-One**: One student has one profile\n- **One-to-Many**: One teacher has many students\n- **Many-to-Many**: Students can enroll in many courses, courses can have many students\n\n### Popular RDBMS\n- **PostgreSQL** — powerful, open-source\n- **MySQL** — widely used, web applications\n- **SQLite** — lightweight, embedded\n- **Oracle** — enterprise, commercial\n\n### ACID Properties\n- **Atomicity** — transactions are all-or-nothing\n- **Consistency** — data remains valid\n- **Isolation** — concurrent transactions don't interfere\n- **Durability** — committed data persists")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("SQL Queries").description("SELECT, INSERT, UPDATE, DELETE, JOIN").orderIndex(2)
                                .content("## SQL Queries\n\nSQL (Structured Query Language) is used to communicate with databases.\n\n### SELECT — Reading data\n```sql\n-- All columns\nSELECT * FROM students;\n\n-- Specific columns\nSELECT name, email FROM students;\n\n-- With condition\nSELECT * FROM students WHERE age > 20;\n\n-- Sorting\nSELECT * FROM students ORDER BY name ASC;\n\n-- Limiting results\nSELECT * FROM students LIMIT 10;\n```\n\n### INSERT — Adding data\n```sql\nINSERT INTO students (name, age, email)\nVALUES ('Charlie', 21, 'charlie@mail.com');\n```\n\n### UPDATE — Modifying data\n```sql\nUPDATE students\nSET age = 23\nWHERE name = 'Bob';\n```\n\n### DELETE — Removing data\n```sql\nDELETE FROM students WHERE id = 3;\n```\n\n### JOIN — Combining tables\n```sql\n-- INNER JOIN\nSELECT s.name, c.title\nFROM students s\nINNER JOIN enrollments e ON s.id = e.student_id\nINNER JOIN courses c ON e.course_id = c.id;\n\n-- LEFT JOIN (includes all left table rows)\nSELECT s.name, g.score\nFROM students s\nLEFT JOIN grades g ON s.id = g.student_id;\n```\n\n### Aggregate Functions\n```sql\nSELECT COUNT(*) FROM students;\nSELECT AVG(age) FROM students;\nSELECT MAX(score) FROM grades;\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("NoSQL Databases").description("MongoDB, document model").orderIndex(3)
                                .content("## NoSQL Databases\n\nNoSQL databases store data in formats other than traditional tables.\n\n### Types of NoSQL\n- **Document** — MongoDB (JSON-like documents)\n- **Key-Value** — Redis (fast lookups)\n- **Column-Family** — Cassandra (wide columns)\n- **Graph** — Neo4j (relationships)\n\n### MongoDB Basics\nMongoDB stores data as JSON-like documents:\n```json\n{\n    \"_id\": \"507f1f77bcf86cd799439011\",\n    \"name\": \"Alice\",\n    \"age\": 20,\n    \"courses\": [\"Python\", \"JavaScript\"],\n    \"address\": {\n        \"city\": \"Almaty\",\n        \"country\": \"Kazakhstan\"\n    }\n}\n```\n\n### MongoDB Operations\n```javascript\n// Find\ndb.students.find({ age: { $gt: 20 } });\n\n// Insert\ndb.students.insertOne({ name: \"Bob\", age: 22 });\n\n// Update\ndb.students.updateOne(\n    { name: \"Alice\" },\n    { $set: { age: 21 } }\n);\n\n// Delete\ndb.students.deleteOne({ name: \"Charlie\" });\n```\n\n### SQL vs NoSQL\n| Feature     | SQL          | NoSQL         |\n|-------------|--------------|---------------|\n| Schema      | Fixed        | Flexible      |\n| Scaling     | Vertical     | Horizontal    |\n| Relations   | Strong       | Weak/None     |\n| Consistency | ACID         | Eventual      |")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Database Design").description("Normalization, indexing, optimization").orderIndex(4)
                                .content("## Database Design\n\nGood database design ensures data integrity, reduces redundancy, and improves performance.\n\n### Normalization\nOrganizing data to reduce redundancy:\n\n**1NF** — Each column contains atomic values, no repeating groups\n**2NF** — All non-key columns depend on the entire primary key\n**3NF** — No non-key column depends on another non-key column\n\n### Example: Before Normalization\n```\n| student | course  | teacher   |\n|---------|---------|-----------|  \n| Alice   | Python  | Dr. Smith |\n| Alice   | Java    | Dr. Jones |\n| Bob     | Python  | Dr. Smith |  (redundant teacher info)\n```\n\n### After Normalization\n```\nStudents: | id | name  |\nCourses:  | id | title  | teacher_id |\nTeachers: | id | name   |\nEnrollments: | student_id | course_id |\n```\n\n### Indexing\nIndexes speed up data retrieval:\n```sql\nCREATE INDEX idx_students_email\nON students(email);\n\n-- Composite index\nCREATE INDEX idx_name_age\nON students(name, age);\n```\n\n### Optimization Tips\n- Use indexes on frequently queried columns\n- Avoid `SELECT *` — select only needed columns\n- Use `EXPLAIN` to analyze query performance\n- Denormalize only when necessary for read performance\n- Use connection pooling for application databases")
                                .build()
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
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("C++ Basics").description("Syntax, variables, I/O").orderIndex(1)
                                .content("## C++ Basics\n\nC++ is a powerful, general-purpose language used in systems programming, game development, and high-performance applications.\n\n### Hello World\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}\n```\n\n### Variables and Data Types\n```cpp\nint age = 25;\ndouble price = 19.99;\nchar grade = 'A';\nbool isActive = true;\nstring name = \"Alice\";\n```\n\n### Input/Output\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    \n    cout << \"Enter your name: \";\n    cin >> name;\n    cout << \"Enter your age: \";\n    cin >> age;\n    \n    cout << name << \" is \" << age << \" years old.\" << endl;\n    return 0;\n}\n```\n\n### Control Structures\n```cpp\n// If-else\nif (age >= 18) {\n    cout << \"Adult\";\n} else {\n    cout << \"Minor\";\n}\n\n// For loop\nfor (int i = 0; i < 10; i++) {\n    cout << i << \" \";\n}\n\n// While loop\nwhile (condition) {\n    // code\n}\n```")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("Pointers & Memory").description("Pointers, references, dynamic memory").orderIndex(2)
                                .content("## Pointers & Memory Management\n\nPointers are variables that store memory addresses. They are fundamental to C++.\n\n### Pointers Basics\n```cpp\nint x = 42;\nint* ptr = &x;   // ptr stores address of x\n\ncout << *ptr;     // 42 (dereference)\ncout << ptr;      // 0x7ffeea1b (address)\n\n*ptr = 100;       // Change x through pointer\ncout << x;        // 100\n```\n\n### References\nAn alias for an existing variable:\n```cpp\nint a = 10;\nint& ref = a;    // ref is an alias for a\n\nref = 20;\ncout << a;       // 20\n\nvoid swap(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n```\n\n### Dynamic Memory\n```cpp\n// Allocate single value\nint* p = new int(42);\ndelete p;\n\n// Allocate array\nint* arr = new int[10];\ndelete[] arr;\n```\n\n### Smart Pointers (Modern C++)\n```cpp\n#include <memory>\n\n// Unique pointer (single ownership)\nauto ptr = make_unique<int>(42);\n\n// Shared pointer (shared ownership)\nauto shared = make_shared<string>(\"Hello\");\n\n// No need to manually delete!\n```\n\n### Common Pitfalls\n- **Memory leak** — forgetting to `delete`\n- **Dangling pointer** — using a deleted pointer\n- **Null pointer** — dereferencing `nullptr`")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("OOP in C++").description("Classes, inheritance, virtual functions").orderIndex(3)
                                .content("## OOP in C++\n\n### Classes\n```cpp\nclass Rectangle {\nprivate:\n    double width;\n    double height;\n\npublic:\n    Rectangle(double w, double h) : width(w), height(h) {}\n    \n    double area() const {\n        return width * height;\n    }\n    \n    double perimeter() const {\n        return 2 * (width + height);\n    }\n};\n\nRectangle rect(5.0, 3.0);\ncout << rect.area();  // 15\n```\n\n### Inheritance\n```cpp\nclass Shape {\nprotected:\n    string color;\npublic:\n    Shape(string c) : color(c) {}\n    virtual double area() = 0;  // Pure virtual\n    virtual ~Shape() {}         // Virtual destructor\n};\n\nclass Circle : public Shape {\n    double radius;\npublic:\n    Circle(double r, string c) : Shape(c), radius(r) {}\n    double area() override {\n        return 3.14159 * radius * radius;\n    }\n};\n```\n\n### Virtual Functions & Polymorphism\n```cpp\nvoid printArea(Shape* shape) {\n    cout << shape->area() << endl;\n}\n\nCircle c(5.0, \"red\");\nRectangle r(3.0, 4.0);\nprintArea(&c);  // 78.5398\nprintArea(&r);  // 12\n```\n\n### Access Modifiers\n- `public` — accessible from anywhere\n- `private` — only within the class\n- `protected` — within class and derived classes")
                                .build(),
                        Course.CourseModule.builder().id(UUID.randomUUID().toString()).title("STL & Templates").description("Containers, algorithms, iterators").orderIndex(4)
                                .content("## STL & Templates\n\nThe Standard Template Library (STL) provides generic data structures and algorithms.\n\n### Containers\n```cpp\n#include <vector>\n#include <map>\n#include <set>\n\n// Vector (dynamic array)\nvector<int> nums = {1, 2, 3, 4, 5};\nnums.push_back(6);\nnums[0];  // 1\nnums.size();  // 6\n\n// Map (key-value)\nmap<string, int> scores;\nscores[\"Alice\"] = 95;\nscores[\"Bob\"] = 87;\n\n// Set (unique sorted elements)\nset<int> unique = {3, 1, 4, 1, 5};\n// Contains: {1, 3, 4, 5}\n```\n\n### Algorithms\n```cpp\n#include <algorithm>\n\nvector<int> v = {5, 2, 8, 1, 9};\n\nsort(v.begin(), v.end());           // {1, 2, 5, 8, 9}\nreverse(v.begin(), v.end());        // {9, 8, 5, 2, 1}\nauto it = find(v.begin(), v.end(), 5);\nint maxVal = *max_element(v.begin(), v.end());\n```\n\n### Templates\nWrite generic code that works with any type:\n```cpp\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\ngetMax(10, 20);       // int: 20\ngetMax(3.14, 2.71);   // double: 3.14\n```\n\n### Iterators\n```cpp\nvector<string> names = {\"Alice\", \"Bob\", \"Charlie\"};\n\n// Range-based for (modern C++)\nfor (const auto& name : names) {\n    cout << name << endl;\n}\n\n// Iterator-based\nfor (auto it = names.begin(); it != names.end(); ++it) {\n    cout << *it << endl;\n}\n```")
                                .build()
                ))
                .testIds(List.of())
                .published(true)
                .createdAt(LocalDateTime.now())
                .build());

        log.info("Default courses created successfully!");
    }
}
