package com.employee.controller;

import com.employee.dto.EmployeeDTO;
import com.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class EmployeeViewController {

    private final EmployeeService employeeService;

    @GetMapping({"/", "/dashboard"})
    public String dashboard(Model model) {
        List<EmployeeDTO> employees = employeeService.getAllEmployees();

        Map<String, Long> departmentBreakdown = employees.stream()
                .filter(employee -> employee.getDepartment() != null && !employee.getDepartment().isBlank())
                .collect(Collectors.groupingBy(EmployeeDTO::getDepartment, Collectors.counting()));

        model.addAttribute("totalEmployees", employees.size());
        model.addAttribute("activeEmployees", employees.stream().filter(e -> e.getActive() == null || e.getActive()).count());
        model.addAttribute("departmentCount", departmentBreakdown.size());
        model.addAttribute("averageSalary", employees.isEmpty() ? 0.0 : employees.stream()
                .mapToDouble(employee -> employee.getSalary() == null ? 0 : employee.getSalary())
                .average()
                .orElse(0.0));
        model.addAttribute("recentEmployees", employees.stream().limit(5).toList());
        model.addAttribute("departmentBreakdown", departmentBreakdown);
        return "dashboard";
    }

    @GetMapping("/employees")
    public String listEmployees(Model model) {
        model.addAttribute("employees", employeeService.getAllEmployees());
        return "employees";
    }

    @GetMapping("/employees/search")
    public String searchEmployees(@RequestParam(value = "name", required = false) String name, Model model) {
        List<EmployeeDTO> employees = (name == null || name.isBlank())
                ? employeeService.getAllEmployees()
                : employeeService.searchByName(name);
        model.addAttribute("employees", employees);
        model.addAttribute("searchTerm", name);
        return "employees";
    }

    @GetMapping("/employees/new")
    public String createForm(Model model) {
        model.addAttribute("employee", new EmployeeDTO());
        model.addAttribute("isEdit", false);
        return "employee-form";
    }

    @GetMapping("/employees/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        model.addAttribute("employee", employee);
        model.addAttribute("isEdit", true);
        return "employee-form";
    }

    @PostMapping("/employees")
    public String createEmployee(@Valid @ModelAttribute("employee") EmployeeDTO employee,
                                 BindingResult bindingResult,
                                 RedirectAttributes redirectAttributes,
                                 Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("isEdit", false);
            return "employee-form";
        }

        employeeService.createEmployee(employee);
        redirectAttributes.addFlashAttribute("successMessage", "Employee created successfully.");
        return "redirect:/employees";
    }

    @PostMapping("/employees/{id}/edit")
    public String updateEmployee(@PathVariable Long id,
                                 @Valid @ModelAttribute("employee") EmployeeDTO employee,
                                 BindingResult bindingResult,
                                 RedirectAttributes redirectAttributes,
                                 Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("isEdit", true);
            return "employee-form";
        }

        employeeService.updateEmployee(id, employee);
        redirectAttributes.addFlashAttribute("successMessage", "Employee updated successfully.");
        return "redirect:/employees";
    }

    @PostMapping("/employees/{id}/delete")
    public String deleteEmployee(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        employeeService.deleteEmployee(id);
        redirectAttributes.addFlashAttribute("successMessage", "Employee deleted successfully.");
        return "redirect:/employees";
    }
}
