package com.employee.service;

import com.employee.dto.EmployeeDTO;
import com.employee.model.Employee;
import com.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void createEmployee_shouldTrimAndNormalizeUserInput() {
        EmployeeDTO input = EmployeeDTO.builder()
                .firstName("  Alice  ")
                .lastName("  Smith  ")
                .email("  alice@example.com  ")
                .department("  Engineering  ")
                .designation("  Software Engineer  ")
                .salary(120000.0)
                .phone(" 9876543210 ")
                .profileImageUrl("  https://example.com/avatar.png  ")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .dateOfJoining(LocalDate.of(2024, 1, 1))
                .build();

        when(employeeRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee employee = Objects.requireNonNull(invocation.getArgument(0));
            employee.setId(1L);
            return employee;
        });

        EmployeeDTO result = employeeService.createEmployee(input);

        assertEquals("Alice", result.getFirstName());
        assertEquals("Smith", result.getLastName());
        assertEquals("alice@example.com", result.getEmail());
        assertEquals("Engineering", result.getDepartment());
        assertEquals("Software Engineer", result.getDesignation());
        assertEquals("9876543210", result.getPhone());
        assertEquals("https://example.com/avatar.png", result.getProfileImageUrl());
        assertEquals(Boolean.TRUE, result.getActive());
        assertTrue(result.getId() != null);
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void searchByName_withBlankKeyword_shouldReturnAllEmployees() {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Alice");
        employee.setLastName("Smith");
        employee.setEmail("alice@example.com");
        employee.setDepartment("Engineering");
        employee.setDesignation("Engineer");
        employee.setSalary(100000.0);
        employee.setActive(true);

        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        List<EmployeeDTO> result = employeeService.searchByName("   ");

        assertEquals(1, result.size());
        assertEquals("Alice", result.get(0).getFirstName());
    }
}
