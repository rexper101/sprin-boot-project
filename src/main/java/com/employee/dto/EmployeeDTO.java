package com.employee.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Data Transfer Object for creating/updating an Employee.
 * Separates the API contract from the JPA entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private Long id;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    private String department;

    @NotBlank(message = "Designation is required")
    @Size(max = 100)
    private String designation;

    
}
