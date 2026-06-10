/**
 * Employee Management System – Frontend Logic
 * Connects to the Spring Boot REST API at /api/employees
 */

const API_BASE = '/api/employees';

// ===== State =====
let allEmployees = [];
let deleteTargetId = null;

// ===== DOM References =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
    sidebar: $('#sidebar'),
    menuToggle: $('#menuToggle'),
    pageTitle: $('#pageTitle'),
    searchInput: $('#searchInput'),
    addBtn: $('#addEmployeeBtn'),
    viewAllBtn: $('#viewAllBtn'),
    // Views
    dashboardView: $('#dashboardView'),
    employeesView: $('#employeesView'),
    // Stats
    totalCount: $('#totalCount'),
    deptCount: $('#deptCount'),
    activeCount: $('#activeCount'),
    avgSalary: $('#avgSalary'),
    // Tables
    recentTableBody: $('#recentTableBody'),
    employeesTableBody: $('#employeesTableBody'),
    dashboardEmpty: $('#dashboardEmpty'),
    employeesEmpty: $('#employeesEmpty'),
    recentTable: $('#recentTable'),
    employeesTable: $('#employeesTable'),
    // Filters
    deptFilter: $('#deptFilter'),
    // Modal
    modalOverlay: $('#modalOverlay'),
    modalTitle: $('#modalTitle'),
    modalClose: $('#modalClose'),
    modalCancelBtn: $('#modalCancelBtn'),
    employeeForm: $('#employeeForm'),
    formEmployeeId: $('#formEmployeeId'),
    formFirstName: $('#formFirstName'),
    formLastName: $('#formLastName'),
    formEmail: $('#formEmail'),
    formDepartment: $('#formDepartment'),
    formDesignation: $('#formDesignation'),
    formSalary: $('#formSalary'),
    formPhone: $('#formPhone'),
    formDob: $('#formDob'),
    formDoj: $('#formDoj'),
    submitBtnText: $('#submitBtnText'),
    submitSpinner: $('#submitSpinner'),
    // Delete modal
    deleteOverlay: $('#deleteOverlay'),
    deleteEmployeeName: $('#deleteEmployeeName'),
    deleteModalClose: $('#deleteModalClose'),
    deleteCancelBtn: $('#deleteCancelBtn'),
    deleteConfirmBtn: $('#deleteConfirmBtn'),
    // Toast
    toastContainer: $('#toastContainer'),
};

// ===== API Helpers =====
async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
}

async function apiPost(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
}

async function apiPut(url, data) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
}

async function apiDelete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Delete failed');
    }
    return res.json();
}

// ===== Toast =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Avatar Color =====
function getAvatarColor(name) {
    const colors = [
        '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
        '#ef4444', '#f97316', '#f59e0b', '#22c55e',
        '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(firstName, lastName) {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
}

function formatSalary(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// ===== Render Functions =====
function updateStats() {
    const total = allEmployees.length;
    const departments = new Set(allEmployees.map(e => e.department));
    const active = allEmployees.filter(e => e.active !== false).length;
    const avgSal = total > 0 ? allEmployees.reduce((s, e) => s + (e.salary || 0), 0) / total : 0;

    animateNumber(dom.totalCount, total);
    animateNumber(dom.deptCount, departments.size);
    animateNumber(dom.activeCount, active);
    dom.avgSalary.textContent = formatSalary(Math.round(avgSal));

    // Update department filter
    const currentFilter = dom.deptFilter.value;
    dom.deptFilter.innerHTML = '<option value="">All Departments</option>';
    [...departments].sort().forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        if (dept === currentFilter) opt.selected = true;
        dom.deptFilter.appendChild(opt);
    });
}

function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const duration = 400;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(current + (target - current) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function renderEmployeeRow(emp, showId = false) {
    const initials = getInitials(emp.firstName, emp.lastName);
    const color = getAvatarColor(emp.firstName + emp.lastName);
    const isActive = emp.active !== false;

    return `
        <tr>
            ${showId ? `<td>#${emp.id}</td>` : ''}
            <td>
                <div class="employee-cell">
                    <div class="avatar" style="background:${color}">${initials}</div>
                    <div>
                        <div class="employee-name">${emp.firstName} ${emp.lastName}</div>
                        ${!showId ? `<div class="employee-email">${emp.email}</div>` : ''}
                    </div>
                </div>
            </td>
            ${showId ? `<td>${emp.email}</td>` : ''}
            <td>${emp.department}</td>
            <td>${emp.designation}</td>
            <td><span class="salary">${formatSalary(emp.salary)}</span></td>
            <td>
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                    <span class="status-dot"></span>${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            ${showId ? `
            <td>
                <div class="actions-cell">
                    <button class="btn-icon edit" title="Edit" onclick="editEmployee(${emp.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon delete" title="Delete" onclick="confirmDelete(${emp.id}, '${emp.firstName} ${emp.lastName}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            </td>` : ''}
        </tr>
    `;
}

function renderDashboard() {
    updateStats();
    const recent = [...allEmployees].reverse().slice(0, 5);

    if (recent.length === 0) {
        dom.recentTable.style.display = 'none';
        dom.dashboardEmpty.style.display = 'flex';
    } else {
        dom.recentTable.style.display = 'table';
        dom.dashboardEmpty.style.display = 'none';
        dom.recentTableBody.innerHTML = recent.map(e => renderEmployeeRow(e, false)).join('');
    }
}

function renderEmployees(employees) {
    if (employees.length === 0) {
        dom.employeesTable.style.display = 'none';
        dom.employeesEmpty.style.display = 'flex';
    } else {
        dom.employeesTable.style.display = 'table';
        dom.employeesEmpty.style.display = 'none';
        dom.employeesTableBody.innerHTML = employees.map(e => renderEmployeeRow(e, true)).join('');
    }
}

function getFilteredEmployees() {
    let filtered = [...allEmployees];
    const search = dom.searchInput.value.trim().toLowerCase();
    const dept = dom.deptFilter.value;

    if (search) {
        filtered = filtered.filter(e =>
            e.firstName.toLowerCase().includes(search) ||
            e.lastName.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search) ||
            e.department.toLowerCase().includes(search) ||
            e.designation.toLowerCase().includes(search)
        );
    }

    if (dept) {
        filtered = filtered.filter(e => e.department === dept);
    }

    return filtered;
}

// ===== Load Data =====
async function loadEmployees() {
    try {
        const res = await apiGet(API_BASE);
        allEmployees = res.data || [];
        renderDashboard();
        renderEmployees(getFilteredEmployees());
    } catch (err) {
        showToast('Failed to load employees: ' + err.message, 'error');
    }
}

// ===== Navigation =====
function switchView(view) {
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    $$('.view').forEach(v => v.classList.remove('active'));

    if (view === 'dashboard') {
        dom.dashboardView.classList.add('active');
        dom.pageTitle.textContent = 'Dashboard';
        $('#nav-dashboard').classList.add('active');
    } else {
        dom.employeesView.classList.add('active');
        dom.pageTitle.textContent = 'Employees';
        $('#nav-employees').classList.add('active');
        renderEmployees(getFilteredEmployees());
    }
}

// ===== Modal =====
function openModal(isEdit = false) {
    dom.modalOverlay.classList.add('show');
    dom.modalTitle.textContent = isEdit ? 'Edit Employee' : 'Add Employee';
    dom.submitBtnText.textContent = isEdit ? 'Update Employee' : 'Create Employee';
    clearFormErrors();
}

function closeModal() {
    dom.modalOverlay.classList.remove('show');
    dom.employeeForm.reset();
    dom.formEmployeeId.value = '';
    clearFormErrors();
}

function clearFormErrors() {
    $$('.form-error').forEach(el => el.textContent = '');
    $$('.form-group input').forEach(el => el.classList.remove('error'));
}

// ===== Form Validation =====
function validateForm() {
    clearFormErrors();
    let valid = true;

    const fields = [
        { id: 'formFirstName', error: 'errorFirstName', msg: 'First name is required' },
        { id: 'formLastName', error: 'errorLastName', msg: 'Last name is required' },
        { id: 'formEmail', error: 'errorEmail', msg: 'Valid email is required' },
        { id: 'formDepartment', error: 'errorDepartment', msg: 'Department is required' },
        { id: 'formDesignation', error: 'errorDesignation', msg: 'Designation is required' },
        { id: 'formSalary', error: 'errorSalary', msg: 'Salary must be a positive number' },
    ];

    fields.forEach(f => {
        const input = $(`#${f.id}`);
        const errorEl = $(`#${f.error}`);
        const val = input.value.trim();

        if (!val) {
            errorEl.textContent = f.msg;
            input.classList.add('error');
            valid = false;
        } else if (f.id === 'formEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            errorEl.textContent = 'Enter a valid email address';
            input.classList.add('error');
            valid = false;
        } else if (f.id === 'formSalary' && (isNaN(val) || Number(val) <= 0)) {
            errorEl.textContent = 'Salary must be a positive number';
            input.classList.add('error');
            valid = false;
        }
    });

    const phone = dom.formPhone.value.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
        $('#errorPhone').textContent = 'Phone must be 10 digits';
        dom.formPhone.classList.add('error');
        valid = false;
    }

    return valid;
}

function getFormData() {
    return {
        firstName: dom.formFirstName.value.trim(),
        lastName: dom.formLastName.value.trim(),
        email: dom.formEmail.value.trim(),
        department: dom.formDepartment.value.trim(),
        designation: dom.formDesignation.value.trim(),
        salary: parseFloat(dom.formSalary.value),
        phone: dom.formPhone.value.trim() || null,
        dateOfBirth: dom.formDob.value || null,
        dateOfJoining: dom.formDoj.value || null,
    };
}

// ===== CRUD =====
async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const data = getFormData();
    const id = dom.formEmployeeId.value;
    const isEdit = !!id;

    dom.submitBtnText.style.display = 'none';
    dom.submitSpinner.style.display = 'block';

    try {
        if (isEdit) {
            await apiPut(`${API_BASE}/${id}`, data);
            showToast('Employee updated successfully');
        } else {
            await apiPost(API_BASE, data);
            showToast('Employee created successfully');
        }
        closeModal();
        await loadEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        dom.submitBtnText.style.display = 'inline';
        dom.submitSpinner.style.display = 'none';
    }
}

window.editEmployee = async function (id) {
    const emp = allEmployees.find(e => e.id === id);
    if (!emp) return;

    dom.formEmployeeId.value = emp.id;
    dom.formFirstName.value = emp.firstName;
    dom.formLastName.value = emp.lastName;
    dom.formEmail.value = emp.email;
    dom.formDepartment.value = emp.department;
    dom.formDesignation.value = emp.designation;
    dom.formSalary.value = emp.salary;
    dom.formPhone.value = emp.phone || '';
    dom.formDob.value = emp.dateOfBirth || '';
    dom.formDoj.value = emp.dateOfJoining || '';

    openModal(true);
};

window.confirmDelete = function (id, name) {
    deleteTargetId = id;
    dom.deleteEmployeeName.textContent = name;
    dom.deleteOverlay.classList.add('show');
};

async function handleDelete() {
    if (!deleteTargetId) return;

    try {
        await apiDelete(`${API_BASE}/${deleteTargetId}`);
        showToast('Employee deleted successfully');
        dom.deleteOverlay.classList.remove('show');
        deleteTargetId = null;
        await loadEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Event Listeners =====
function init() {
    // Navigation
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
            dom.sidebar.classList.remove('open');
        });
    });

    dom.viewAllBtn.addEventListener('click', () => switchView('employees'));

    // Mobile menu
    dom.menuToggle.addEventListener('click', () => {
        dom.sidebar.classList.toggle('open');
    });

    // Search
    let searchTimeout;
    dom.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderEmployees(getFilteredEmployees());
        }, 250);
    });

    // Department filter
    dom.deptFilter.addEventListener('change', () => {
        renderEmployees(getFilteredEmployees());
    });

    // Add Employee
    dom.addBtn.addEventListener('click', () => openModal(false));

    // Modal close
    dom.modalClose.addEventListener('click', closeModal);
    dom.modalCancelBtn.addEventListener('click', closeModal);
    dom.modalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.modalOverlay) closeModal();
    });

    // Form submit
    dom.employeeForm.addEventListener('submit', handleFormSubmit);

    // Delete modal
    dom.deleteModalClose.addEventListener('click', () => dom.deleteOverlay.classList.remove('show'));
    dom.deleteCancelBtn.addEventListener('click', () => dom.deleteOverlay.classList.remove('show'));
    dom.deleteConfirmBtn.addEventListener('click', handleDelete);
    dom.deleteOverlay.addEventListener('click', (e) => {
        if (e.target === dom.deleteOverlay) dom.deleteOverlay.classList.remove('show');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            dom.deleteOverlay.classList.remove('show');
        }
    });

    // Initial load
    loadEmployees();
}

document.addEventListener('DOMContentLoaded', init);
