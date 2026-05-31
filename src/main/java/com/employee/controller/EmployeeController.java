package com.employee.controller;

import com.employee.dto.ApiResponse;
import com.employee.dto.EmployeeDTO;
import com.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing Employee CRUD and search endpoints.
 *
 * Base path: /api/employees
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")  // Allow all origins (configure per environment in production)
public class EmployeeController {

    private final EmployeeService employeeService;

    // ===================== CRUD Endpoints =====================

    /**
     * POST /api/employees
     * Create a new employee.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(
            @Valid @RequestBody EmployeeDTO employeeDTO) {

        EmployeeDTO created = employeeService.createEmployee(employeeDTO);
        return new ResponseEntity<>(
                ApiResponse.created("Employee created successfully", created),
                HttpStatus.CREATED
        );
    }