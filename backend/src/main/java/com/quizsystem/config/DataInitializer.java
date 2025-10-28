package com.quizsystem.config;

import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if not exists
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

        // Create default test user if not exists
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
    }
}
