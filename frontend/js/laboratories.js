const API = "/api";

let allLabs = [];

// AUTHENTICATION AND USER INFORMATION
document.addEventListener("DOMContentLoaded", async () => {
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.getElementById("userAvatar");
    const logoutButton = document.getElementById("logoutButton");

    // Check login session
    try {
        const data = await apiRequest("/auth/me");

        userEmail.textContent = data.user.email;
        userAvatar.textContent =
            data.user.email.charAt(0).toUpperCase();

    } catch (error) {
        console.error("Session check failed:", error.message);
        window.location.href = "login.html";
        return;
    }

    // Logout
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Signing out...";

        try {
            await apiRequest("/auth/logout", {
                method: "POST"
            });

            window.location.href = "login.html";

        } catch (error) {
            alert(error.message || "Unable to log out.");

            logoutButton.disabled = false;
            logoutButton.textContent = "Sign Out";
        }
    });

    // Load laboratories after session verification
    await loadLabs();
});

// LABORATORY MANAGEMENT
function toggleForm() {
    const form = document.getElementById("addForm");
    if (!form) return;

    if (form.classList.contains("hidden")) {
        form.classList.remove("hidden");
        resetForm();
    } else {
        form.classList.add("hidden");
    }
}

function resetForm() {
    const fields = {
        formTitle: "Create New Lab",
        submitBtn: "Add Laboratory",
        editId: "",
        lab_name: "",
        location: "",
        capacity: "",
        type_id: "1",
        status_id: "1"
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (!element) return;

        if (id === "formTitle" || id === "submitBtn") {
            element.innerText = value;
        } else {
            element.value = value;
        }
    });
}

// LOAD LABORATORIES
async function loadLabs() {
    const list = document.getElementById("labList");
    if (!list) return;

    list.innerHTML =
        "<p class='loading-msg'>Loading laboratories...</p>";

    try {
        const data = await apiRequest("/laboratories");

        if (data.success) {
            allLabs = data.data;
            renderList(allLabs);
        } else {
            list.innerHTML =
                `<p class='error-msg'>Error: ${
                    data.error?.message ||
                    "Unable to load laboratories."
                }</p>`;
        }

    } catch (err) {
        list.innerHTML =
            "<p class='error-msg'>Could not connect to server.</p>";

        console.error("Error loading labs:", err);
    }
}


// ========================================
// DISPLAY LABORATORIES
// ========================================

function renderList(labs) {
    const list = document.getElementById("labList");
    if (!list) return;

    list.innerHTML = "";

    if (!labs || labs.length === 0) {
        list.innerHTML =
            "<p>No laboratories found in database.</p>";
        return;
    }

    labs.forEach(lab => {
        const div = document.createElement("div");

        let statusClass = "";

        if (lab.status_name === "Available") {
            statusClass = "available";
        } else if (lab.status_name === "Maintenance") {
            statusClass = "maintenance";
        } else {
            statusClass = "unavailable";
        }

        div.className = `lab-item ${statusClass}`;

        div.innerHTML = `
            <div>
                <strong>${escapeHTML(lab.lab_name)}</strong><br>
                <small>
                    Location: ${escapeHTML(lab.location)}
                    | Capacity: ${escapeHTML(lab.capacity)}
                </small>
            </div>

            <div class="btn-group">
                <button class="btn-edit"
                    onclick="editLab(event, ${lab.lab_id})">
                    Edit
                </button>

                <button class="btn-delete"
                    onclick="deleteLab(event, ${lab.lab_id})">
                    Delete
                </button>
            </div>
        `;

        div.onclick = () => showStatus(lab);

        list.appendChild(div);
    });
}


// Prevent database content from being interpreted as HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// ========================================
// LABORATORY STATUS
// ========================================

function showStatus(lab) {
    const nameDisplay = document.getElementById("selectedName");
    const resultBox = document.getElementById("statusResult");

    if (!nameDisplay || !resultBox) return;

    nameDisplay.innerText = lab.lab_name;

    resultBox.style.display = "block";
    resultBox.className = "status-box";

    if (lab.status_name === "Available") {
        resultBox.classList.add("status-available");
        resultBox.innerHTML = "AVAILABLE";

    } else if (lab.status_name === "Maintenance") {
        resultBox.classList.add("status-maintenance");
        resultBox.innerHTML = "UNDER MAINTENANCE";

    } else {
        resultBox.classList.add("status-unavailable");
        resultBox.innerHTML = "UNAVAILABLE";
    }
}


// ========================================
// ADD / UPDATE LABORATORY
// ========================================

async function saveLab() {
    const editId = document.getElementById("editId")?.value;
    const labName =
        document.getElementById("lab_name")?.value.trim();

    const location =
        document.getElementById("location")?.value.trim();

    const capacity =
        Number(document.getElementById("capacity")?.value);

    const type_id =
        Number(document.getElementById("type_id")?.value);

    const status_id =
        Number(document.getElementById("status_id")?.value);

    if (!labName || !location || !capacity || !type_id || !status_id) {
        alert("Please fill in all fields.");
        return;
    }

    if (!editId) {
        const duplicate = allLabs.find(
            lab => lab.lab_name.toLowerCase() === labName.toLowerCase()
        );

        if (duplicate) {
            alert("Lab already exists with this name.");
            return;
        }
    }

    const body = {
        lab_name: labName,
        location,
        capacity,
        type_id,
        status_id
    };

    let endpoint = "/laboratories";
    let method = "POST";

    if (editId) {
        endpoint = `/laboratories/${editId}`;
        method = "PUT";
    }

    try {
        const data = await apiRequest(endpoint, {
            method,
            body: JSON.stringify(body)
        });

        if (data.success) {
            alert(editId ? "Lab updated!" : "Lab added!");

            document.getElementById("addForm")
                ?.classList.add("hidden");

            resetForm();

            await loadLabs();

        } else {
            alert(
                "Error: " +
                (data.error?.message ||
                "Unable to save laboratory.")
            );
        }

    } catch (err) {
        console.error("Error saving laboratory:", err);
        alert(err.message || "Unable to connect to the server.");
    }
}


// ========================================
// EDIT LABORATORY
// ========================================

function editLab(event, id) {
    event.stopPropagation();

    const lab = allLabs.find(
        l => Number(l.lab_id) === Number(id)
    );

    if (!lab) return;

    document.getElementById("editId").value = lab.lab_id;
    document.getElementById("lab_name").value = lab.lab_name;
    document.getElementById("location").value = lab.location;
    document.getElementById("capacity").value = lab.capacity;
    document.getElementById("type_id").value = lab.type_id;
    document.getElementById("status_id").value = lab.status_id;

    document.getElementById("formTitle").innerText = "Edit Lab";
    document.getElementById("submitBtn").innerText =
        "Update Laboratory";

    document.getElementById("addForm")
        .classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// DELETE LABORATORY
// ========================================

async function deleteLab(event, id) {
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this laboratory?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/laboratories/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        if (response.status === 204) {
            alert("Laboratory deleted successfully!");
            await loadLabs();
            return;
        }

        const text = await response.text();
        const result = text ? JSON.parse(text) : null;

        if (!response.ok || result?.success === false) {
            throw new Error(
                result?.error?.message ||
                "Unable to delete laboratory."
            );
        }

        alert("Laboratory deleted successfully!");
        await loadLabs();

    } catch (error) {
        console.error("Error deleting laboratory:", error);

        alert(error.message || "Unable to delete laboratory.");
    }
}
