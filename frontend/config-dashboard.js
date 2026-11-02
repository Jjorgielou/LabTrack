// API configuration
const API_BASE_URL = "http://127.0.0.1:3000/api";

// Current user
let currentUser = null;
let currentRole = "";

// Navigation elements
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

// Database-backed data
let departments = [];
let courses = [];

// Display messages
function showMessage(message) {
    alert(message);
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}

// Check the logged-in user
async function loadCurrentUser() {
    try {
        const result = await apiRequest("/auth/me");

        currentUser = result.user;
        currentRole = currentUser.role;

        updateInterfaceByRole();
    } catch (error) {
        console.error("Authentication error:", error);
        alert("Your session has expired. Please log in again.");
        window.location.href = "login.html";
        throw error;
    }
}

// Apply role-based interface permissions
function updateInterfaceByRole() {
    const headerLabel = document.querySelector(".topbar span");

    if (headerLabel) {
        headerLabel.textContent = `${currentRole} Panel`;
    }

    const canManage = ["Admin", "Laboratory Staff"].includes(currentRole);
    const isAdmin = currentRole === "Admin";

    // Show or hide department and course forms
    const departmentForm = document.getElementById("department-form");
    const courseForm = document.getElementById("course-form");

    if (departmentForm) {
        departmentForm.classList.toggle("hidden", !canManage);
    }

    if (courseForm) {
        courseForm.classList.toggle("hidden", !canManage);
    }

    // Store permissions for list rendering
    window.labtrackPermissions = {
        canManage,
        isAdmin
    };

    // Hide delete buttons for non-admin users
    displayDepartments();
    displayCourses();
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const selectedPage = this.dataset.page;

        pages.forEach(section => section.classList.add("hidden"));

        const targetPage = document.getElementById(selectedPage);

        if (targetPage) {
            targetPage.classList.remove("hidden");
        }

        navLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

        if (pageTitle) {
            pageTitle.textContent = this.textContent.trim();
        }
    });
});

// Update dashboard counts
function updateDashboard() {
    document.getElementById("department-count").textContent =
        departments.length;

    document.getElementById("course-count").textContent =
        courses.length;
}

// Load departments from database
async function loadDepartments() {
    try {
        const result = await apiRequest("/departments");

        departments = result.data || [];

        displayDepartments();
        populateDepartmentDropdown();
        updateDashboard();
    } catch (error) {
        console.error("Load departments error:", error);
        showMessage("Unable to load departments: " + error.message);
    }
}

// Display departments
function displayDepartments() {
    const list = document.getElementById("department-list");

    if (!list) return;

    list.innerHTML = "";

    if (departments.length === 0) {
        list.textContent = "No departments found.";
        return;
    }

    const permissions = window.labtrackPermissions || {};
    const isAdmin = permissions.isAdmin;

    departments.forEach((department, index) => {
        const item = document.createElement("div");
        item.className = "list-item";

        const name = document.createElement("span");
        name.textContent =
            `${index + 1}. ${department.department_name}`;

        item.appendChild(name);

        if (isAdmin) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async () => {
                if (!confirm(`Delete ${department.department_name}?`)) {
                    return;
                }

                try {
                    await apiRequest(
                        `/departments/${department.department_id}`,
                        { method: "DELETE" }
                    );

                    await loadDepartments();
                    await loadCourses();

                    showMessage("Department deleted successfully.");
                } catch (error) {
                    showMessage(error.message);
                }
            });

            item.appendChild(deleteButton);
        }

        list.appendChild(item);
    });
}

// Populate department dropdown for courses
function populateDepartmentDropdown() {
    const dropdown = document.getElementById("course-department");

    if (!dropdown) return;

    dropdown.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Department";
    dropdown.appendChild(defaultOption);

    departments.forEach(department => {
        const option = document.createElement("option");
        option.value = department.department_id;
        option.textContent = department.department_name;

        dropdown.appendChild(option);
    });
}

// Add department
const departmentForm = document.getElementById("department-form");

if (departmentForm) {
    departmentForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!window.labtrackPermissions?.canManage) {
            showMessage("You do not have permission to add departments.");
            return;
        }

        const departmentName =
            document.getElementById("department-name").value.trim();

        if (!departmentName) {
            showMessage("Please enter a department name.");
            return;
        }

        try {
            await apiRequest("/departments", {
                method: "POST",
                body: JSON.stringify({
                    department_name: departmentName
                })
            });

            this.reset();
            await loadDepartments();

            showMessage("Department added successfully.");
        } catch (error) {
            showMessage(error.message);
        }
    });
}

// Load courses from database
async function loadCourses() {
    try {
        const result = await apiRequest("/courses");

        courses = result.data || [];

        displayCourses();
        updateDashboard();
    } catch (error) {
        console.error("Load courses error:", error);
        showMessage("Unable to load courses: " + error.message);
    }
}

// Display courses
function displayCourses() {
    const list = document.getElementById("course-list");

    if (!list) return;

    list.innerHTML = "";

    if (courses.length === 0) {
        list.textContent = "No courses found.";
        return;
    }

    const permissions = window.labtrackPermissions || {};
    const isAdmin = permissions.isAdmin;

    courses.forEach((course, index) => {
        const item = document.createElement("div");
        item.className = "list-item";

        const details = document.createElement("span");
        details.textContent =
            `${index + 1}. ${course.course_name} (${course.course_code}) - ${course.department_name}`;

        item.appendChild(details);

        if (isAdmin) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async () => {
                if (!confirm(`Delete ${course.course_name}?`)) {
                    return;
                }

                try {
                    await apiRequest(
                        `/courses/${course.course_id}`,
                        { method: "DELETE" }
                    );

                    await loadCourses();

                    showMessage("Course deleted successfully.");
                } catch (error) {
                    showMessage(error.message);
                }
            });

            item.appendChild(deleteButton);
        }

        list.appendChild(item);
    });
}

// Add course
const courseForm = document.getElementById("course-form");

if (courseForm) {
    courseForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!window.labtrackPermissions?.canManage) {
            showMessage("You do not have permission to add courses.");
            return;
        }

        const courseName =
            document.getElementById("course-name").value.trim();

        const courseCode =
            document.getElementById("course-code").value.trim();

        const departmentId =
            document.getElementById("course-department").value;

        if (!courseName || !courseCode || !departmentId) {
            showMessage("Please complete all course fields.");
            return;
        }

        try {
            await apiRequest("/courses", {
                method: "POST",
                body: JSON.stringify({
                    course_name: courseName,
                    course_code: courseCode,
                    department_id: Number(departmentId)
                })
            });

            this.reset();
            await loadCourses();

            showMessage("Course added successfully.");
        } catch (error) {
            showMessage(error.message);
        }
    });
}

// Initial dashboard loading
async function initializeDashboard() {
    try {
        await loadCurrentUser();
        await loadDepartments();
        await loadCourses();
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
    }
}

initializeDashboard();
