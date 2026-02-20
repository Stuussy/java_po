package com.quizsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least 1 uppercase letter")
    @Pattern(regexp = ".*[a-z].*", message = "Password must contain at least 1 lowercase letter")
    @Pattern(regexp = ".*\\d.*", message = "Password must contain at least 1 digit")
    @Pattern(regexp = ".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?~`].*", message = "Password must contain at least 1 special character")
    @Pattern(regexp = "^\\S+$", message = "Password must not contain spaces")
    private String password;

    private String organization;
}
