
// Current user
let currentUser = null;
let currentRole = "";

// Database-backed data
let departments = [];
let courses = [];

// Display messages
function showMessage(message) {
    alert(message);
}

// Check the logged-in user
async function loadCurrentUser() {
    try {
        const result = await apiRequest("/auth/me");

        currentUser = result.user;
        currentRole = currentUser.role;

        const userEmail = document.getElementById("userEmail");
        const userAvatar = document.getElementById("userAvatar");

        if (userEmail) {
            userEmail.textContent = currentUser.email;
        }

        if (userAvatar) {
            userAvatar.textContent =
                currentUser.email.charAt(0).toUpperCase();
        }

        const profileName = document.getElementById("profileName");
        const profileRole = document.getElementById("profileRole");

        if (profileName) {
            profileName.textContent =
                currentUser.name || currentUser.email;
        }

        if (profileRole) {
            profileRole.textContent = currentUser.role;
        }

        const profileAvatar = document.querySelector(".profile-avatar");

        if (profileAvatar) {
            profileAvatar.textContent =
                currentUser.email.charAt(0).toUpperCase();
        }

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
    const canManage = ["Admin", "Laboratory Staff"].includes(currentRole);
    const isAdmin = currentRole === "Admin";

    const departmentForm = document.getElementById("department-form");
    const courseForm = document.getElementById("course-form");

    if (departmentForm) {
        departmentForm.classList.toggle("hidden", !canManage);
    }

    if (courseForm) {
        courseForm.classList.toggle("hidden", !canManage);
    }

    window.labtrackPermissions = {
        canManage,
        isAdmin
    };

    displayDepartments();
    displayCourses();
}

// Load departments from database
async function loadDepartments() {
    try {
        const result = await apiRequest("/departments");

        departments = result.data || [];

        displayDepartments();
        populateDepartmentDropdown();

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
        list.innerHTML = `
            <tr>
                <td colspan="3">No departments found.</td>
            </tr>
        `;
        return;
    }

    const isAdmin = window.labtrackPermissions?.isAdmin;

    departments.forEach((department, index) => {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = department.department_name;

        const actionCell = document.createElement("td");

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

            actionCell.appendChild(deleteButton);
        } else {
            actionCell.textContent = "—";
        }

        row.append(numberCell, nameCell, actionCell);
        list.appendChild(row);
    });
}

// Populate department dropdown
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
        list.innerHTML = `
            <tr>
                <td colspan="5">No courses found.</td>
            </tr>
        `;
        return;
    }

    const isAdmin = window.labtrackPermissions?.isAdmin;

    courses.forEach((course, index) => {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = course.course_name;

        const codeCell = document.createElement("td");
        codeCell.textContent = course.course_code;

        const departmentCell = document.createElement("td");
        departmentCell.textContent = course.department_name;

        const actionCell = document.createElement("td");

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

            actionCell.appendChild(deleteButton);
        } else {
            actionCell.textContent = "—";
        }

        row.append(
            numberCell,
            nameCell,
            codeCell,
            departmentCell,
            actionCell
        );

        list.appendChild(row);
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

// Sign Out
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async function() {
        if (!confirm("Are you sure you want to sign out?")) {
            return;
        }

        logoutButton.disabled = true;
        logoutButton.textContent = "Signing out...";

        try {
            await apiRequest("/auth/logout", {
                method: "POST"
            });

            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);

            showMessage("Unable to sign out: " + error.message);

            logoutButton.disabled = false;
            logoutButton.textContent = "Sign Out";
        }
    });
}

// Initial page loading
async function initializePage() {
    try {
        await loadCurrentUser();

        await loadDepartments();
        await loadCourses();

    } catch (error) {
        console.error("Page initialization failed:", error);
    }
}

initializePage();
