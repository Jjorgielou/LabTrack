// Navigation
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

// Temporary frontend data
let departments = [];
let courses = [];

// Navigation Function
navLinks.forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const selectedPage = this.dataset.page;

        pages.forEach(section => {
            section.classList.add("hidden");
        });

        document.getElementById(selectedPage).classList.remove("hidden");

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

        pageTitle.textContent = this.textContent;
    });
});

// Update Dashboard
function updateDashboard() {
    document.getElementById("department-count").textContent =
        departments.length;

    document.getElementById("course-count").textContent =
        courses.length;
}

// Add Department
document.getElementById("department-form")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("department-name").value.trim();

        if (name === "") {
            alert("Please enter a department name.");
            return;
        }

        departments.push(name);

        displayDepartments();
        this.reset();
        updateDashboard();
    });

// Display Departments
function displayDepartments() {
    const list = document.getElementById("department-list");

    list.innerHTML = "";

    departments.forEach((department, index) => {
        const item = document.createElement("div");
        item.className = "list-item";

        const name = document.createElement("span");
        name.textContent = (index + 1) + ". " + department;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            departments.splice(index, 1);

            displayDepartments();
            updateDashboard();
        });

        item.appendChild(name);
        item.appendChild(deleteButton);

        list.appendChild(item);
    });
}

// Add Course
document.getElementById("course-form")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("course-name").value.trim();

        if (name === "") {
            alert("Please enter a course name.");
            return;
        }

        courses.push(name);

        displayCourses();
        this.reset();
        updateDashboard();
    });

// Display Courses
function displayCourses() {
    const list = document.getElementById("course-list");

    list.innerHTML = "";

    courses.forEach((course, index) => {
        const item = document.createElement("div");
        item.className = "list-item";

        const name = document.createElement("span");
        name.textContent = (index + 1) + ". " + course;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            courses.splice(index, 1);

            displayCourses();
            updateDashboard();
        });

        item.appendChild(name);
        item.appendChild(deleteButton);

        list.appendChild(item);
    });
}

// Initial Dashboard
updateDashboard();