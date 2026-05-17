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

