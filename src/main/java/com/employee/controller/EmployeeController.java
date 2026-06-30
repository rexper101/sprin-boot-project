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

    /**
     * GET /api/employees
     * Retrieve all employees.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllEmployees() {
        List<EmployeeDTO> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(
                ApiResponse.success("Employees retrieved successfully", employees)
        );
    }

    /**
     * GET /api/employees/{id}
     * Retrieve a single employee by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeById(
            @PathVariable Long id) {

        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Employee retrieved successfully", employee)
        );
    }

    /**
     * PUT /api/employees/{id}
     * Update an existing employee.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO employeeDTO) {

        EmployeeDTO updated = employeeService.updateEmployee(id, employeeDTO);
        return ResponseEntity.ok(
                ApiResponse.success("Employee updated successfully", updated)
        );
    }

    /**
     * DELETE /api/employees/{id}
     * Delete an employee.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(
                ApiResponse.success("Employee deleted successfully", null)
        );
    }

    // ===================== Search / Filter Endpoints =====================

    /**
     * GET /api/employees/search?name=keyword
     * Search employees by first or last name.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> searchByName(
            @RequestParam String name) {

        List<EmployeeDTO> results = employeeService.searchByName(name);
        return ResponseEntity.ok(
                ApiResponse.success("Search results retrieved", results)
        );
    }

    /**
     * GET /api/employees/department/{department}
     * Filter employees by department.
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getByDepartment(
            @PathVariable String department) {

        List<EmployeeDTO> results = employeeService.getByDepartment(department);
        return ResponseEntity.ok(
                ApiResponse.success("Employees in department '" + department + "' retrieved", results)
        );
    }

    /**
     * GET /api/employees/status?active=true|false
     * Filter employees by active status.
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getByActiveStatus(
            @RequestParam Boolean active) {

        List<EmployeeDTO> results = employeeService.getByActiveStatus(active);
        return ResponseEntity.ok(
                ApiResponse.success("Employees filtered by active=" + active, results)
        );
    }
}
