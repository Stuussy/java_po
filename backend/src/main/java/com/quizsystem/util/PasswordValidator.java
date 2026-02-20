package com.quizsystem.util;

import java.util.ArrayList;
import java.util.List;

public final class PasswordValidator {

    private PasswordValidator() {}

    public static final int MIN_LENGTH = 8;

    public static List<String> validate(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.length() < MIN_LENGTH) {
            errors.add("Password must be at least " + MIN_LENGTH + " characters");
        }

        if (password != null && password.contains(" ")) {
            errors.add("Password must not contain spaces");
        }

        if (password == null || !password.matches(".*[A-Z].*")) {
            errors.add("Password must contain at least 1 uppercase letter");
        }

        if (password == null || !password.matches(".*[a-z].*")) {
            errors.add("Password must contain at least 1 lowercase letter");
        }

        if (password == null || !password.matches(".*\\d.*")) {
            errors.add("Password must contain at least 1 digit");
        }

        if (password == null || !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?~`].*")) {
            errors.add("Password must contain at least 1 special character (!@#$%^&*...)");
        }

        return errors;
    }

    public static void assertValid(String password) {
        List<String> errors = validate(password);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", errors));
        }
    }
}
