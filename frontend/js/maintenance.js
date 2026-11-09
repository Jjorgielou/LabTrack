const API_BASE = "/api/maintenance";

let requestsData = [];
let recordsData = [];
let statusesData = [];

// Escape database values before displaying them in HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Maintenance API request helper.
async function maintenanceRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const responseText = await response.text();

    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error("The server returned an invalid response.");
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            data?.message ||
            "Unable to complete the request."
        );
    }

    return data;
}

// Display the currently logged-in user.
async function loadUserProfile() {
    try {
        const data = await apiRequest("/auth/me");

        if (!data || !data.user) {
            throw new Error("User information was not returned.");
        }

        const email = data.user.email || "";

        const userEmail = document.getElementById("userEmail");
        const userAvatar = document.getElementById("userAvatar");

        if (userEmail) {
            userEmail.textContent = email;
        }

        if (userAvatar) {
            userAvatar.textContent = email
                ? email.charAt(0).toUpperCase()
                : "U";
        }

        return true;

    } catch (error) {
        console.error("Unable to load user profile:", error);
        window.location.href = "login.html";
        return false;
    }
}

// Load all Maintenance data.
async function loadMaintenanceData() {
    try {
        const [requests, records, statuses] = await Promise.all([
            maintenanceRequest("/requests"),
            maintenanceRequest("/records"),
            maintenanceRequest("/statuses")
        ]);

        requestsData = Array.isArray(requests)
            ? requests
            : requests?.requests || [];

        recordsData = Array.isArray(records)
            ? records
            : records?.records || [];

        statusesData = Array.isArray(statuses)
            ? statuses
            : statuses?.statuses || [];

        displayRequests();
        displayRecords();
        displayStatuses();

    } catch (error) {
        console.error("Failed to load Maintenance data:", error);

        alert(
            "Unable to load Maintenance data. " +
            "Please check your connection and try again."
        );
    }
}

// Display Maintenance Requests.
function displayRequests() {
    const tbody = document.getElementById("requests-tbody");

    if (!tbody) return;

    if (!requestsData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="maintenance-empty">
                    No maintenance requests found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = requestsData.map(request => {
        const id = Number(request.id);

        return `
            <tr>
                <td>${escapeHTML(request.id)}</td>

                <td>
                    ${escapeHTML(
                        request.equipment_id ??
                        request.equipment_name ??
                        "N/A"
                    )}
                </td>

                <td>${escapeHTML(request.description)}</td>

                <td>
                    <span class="maintenance-status-label">
                        ${escapeHTML(request.status)}
                    </span>
                </td>

                <td class="maintenance-actions">
                    <button
                        type="button"
                        class="btn-edit"
                        onclick="openEditModal('requests', ${id})">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        onclick="deleteItem('requests', ${id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Display Maintenance Records.
function displayRecords() {
    const tbody = document.getElementById("records-tbody");

    if (!tbody) return;

    if (!recordsData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="maintenance-empty">
                    No maintenance records found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recordsData.map(record => {
        const id = Number(record.id);

        return `
            <tr>
                <td>${escapeHTML(record.id)}</td>
                <td>${escapeHTML(record.request_id)}</td>
                <td>${escapeHTML(record.work_performed)}</td>
                <td>${escapeHTML(record.technician)}</td>

                <td class="maintenance-actions">
                    <button
                        type="button"
                        class="btn-edit"
                        onclick="openEditModal('records', ${id})">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        onclick="deleteItem('records', ${id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Display Maintenance Statuses.
function displayStatuses() {
    const tbody = document.getElementById("statuses-tbody");

    if (!tbody) return;

    if (!statusesData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="maintenance-empty">
                    No maintenance statuses found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = statusesData.map(status => {
        const id = Number(status.id);

        return `
            <tr>
                <td>${escapeHTML(status.id)}</td>
                <td>${escapeHTML(status.name)}</td>
                <td>${escapeHTML(status.description)}</td>

                <td class="maintenance-actions">
                    <button
                        type="button"
                        class="btn-edit"
                        onclick="openEditModal('statuses', ${id})">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        onclick="deleteItem('statuses', ${id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Show or hide a modal.
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.setAttribute("aria-hidden", show ? "false" : "true");

    document.body.classList.toggle(
        "maintenance-modal-open",
        show
    );

    if (show) {
        modal.querySelector("input:not([type='hidden']), textarea")
            ?.focus();
    }
}

// Close all Maintenance modals.
function closeAllMaintenanceModals() {
    ["issueModal", "recordModal", "statusModal"].forEach(modalId => {
        toggleModal(modalId, false);
    });
}

// Open a blank form for creating an item.
function openCreateModal(modalId) {
    const formIds = {
        issueModal: "issueForm",
        recordModal: "recordForm",
        statusModal: "statusForm"
    };

    const form = document.getElementById(formIds[modalId]);

    if (!form) return;

    form.reset();

    if (modalId === "issueModal") {
        document.getElementById("edit_issue_id").value = "";

        document.getElementById("issueModalTitle").textContent =
            "Report Equipment Issue";

        document.getElementById("equipment_id_container").style.display =
            "block";

        document.getElementById("status_container").style.display =
            "none";
    }

    if (modalId === "recordModal") {
        document.getElementById("edit_record_id").value = "";

        document.getElementById("recordModalTitle").textContent =
            "Log Maintenance Work";

        document.getElementById("rec_request_id_container").style.display =
            "block";
    }

    if (modalId === "statusModal") {
        document.getElementById("edit_status_id").value = "";

        document.getElementById("statusModalTitle").textContent =
            "Add Maintenance Status";
    }

    toggleModal(modalId, true);
}

// Open an existing item for editing.
function openEditModal(type, id) {

    if (type === "requests") {
        const request = requestsData.find(
            item => Number(item.id) === Number(id)
        );

        if (!request) return;

        const form = document.getElementById("issueForm");
        form.reset();

        document.getElementById("edit_issue_id").value = request.id;

        document.getElementById("description").value =
            request.description || "";

        document.getElementById("issue_status").value =
            request.status || "";

        document.getElementById("issueModalTitle").textContent =
            "Edit Maintenance Request";

        document.getElementById("equipment_id_container").style.display =
            "none";

        document.getElementById("status_container").style.display =
            "block";

        toggleModal("issueModal", true);
    }

    else if (type === "records") {
        const record = recordsData.find(
            item => Number(item.id) === Number(id)
        );

        if (!record) return;

        const form = document.getElementById("recordForm");
        form.reset();

        document.getElementById("edit_record_id").value = record.id;

        document.getElementById("work_performed").value =
            record.work_performed || "";

        document.getElementById("technician").value =
            record.technician || "";

        document.getElementById("recordModalTitle").textContent =
            "Edit Maintenance Record";

        document.getElementById("rec_request_id_container").style.display =
            "none";

        toggleModal("recordModal", true);
    }

    else if (type === "statuses") {
        const status = statusesData.find(
            item => Number(item.id) === Number(id)
        );

        if (!status) return;

        const form = document.getElementById("statusForm");
        form.reset();

        document.getElementById("edit_status_id").value = status.id;

        document.getElementById("status_name").value =
            status.name || "";

        document.getElementById("status_description").value =
            status.description || "";

        document.getElementById("statusModalTitle").textContent =
            "Edit Maintenance Status";

        toggleModal("statusModal", true);
    }
}

// Create or update a Maintenance Request.
async function submitIssue(event) {
    event.preventDefault();

    const id = document.getElementById("edit_issue_id").value;

    const description = document.getElementById("description").value.trim();

    const status = document.getElementById("issue_status").value.trim();

    if (!description) {
        alert("Please enter a problem description.");
        return;
    }

    try {
        if (id) {
            await maintenanceRequest(`/requests/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    description,
                    status
                })
            });
        } else {
            const equipmentId =
                document.getElementById("equipment_id").value;

            if (!equipmentId) {
                alert("Please enter an Equipment ID.");
                return;
            }

            await maintenanceRequest("", {
                method: "POST",
                body: JSON.stringify({
                    equipment_id: equipmentId,
                    description
                })
            });
        }

        toggleModal("issueModal", false);

        await loadMaintenanceData();

    } catch (error) {
        console.error("Request save failed:", error);
        alert(error.message);
    }
}

// Create or update a Maintenance Record.
async function submitRecord(event) {
    event.preventDefault();

    const id = document.getElementById("edit_record_id").value;

    const data = {
        work_performed:
            document.getElementById("work_performed").value.trim(),

        technician:
            document.getElementById("technician").value.trim()
    };

    if (!data.work_performed || !data.technician) {
        alert("Please complete all required fields.");
        return;
    }

    try {
        if (id) {
            await maintenanceRequest(`/records/${id}`, {
                method: "PUT",
                body: JSON.stringify(data)
            });
        } else {
            const requestId =
                document.getElementById("rec_request_id").value;

            if (!requestId) {
                alert("Please enter a Request ID.");
                return;
            }

            data.request_id = requestId;

            await maintenanceRequest("/records", {
                method: "POST",
                body: JSON.stringify(data)
            });
        }

        toggleModal("recordModal", false);

        await loadMaintenanceData();

    } catch (error) {
        console.error("Record save failed:", error);
        alert(error.message);
    }
}

// Create or update a Maintenance Status.
async function submitStatus(event) {
    event.preventDefault();

    const id = document.getElementById("edit_status_id").value;

    const data = {
        name: document.getElementById("status_name").value.trim(),

        description:
            document.getElementById("status_description").value.trim()
    };

    if (!data.name) {
        alert("Please enter a status name.");
        return;
    }

    try {
        if (id) {
            await maintenanceRequest(`/statuses/${id}`, {
                method: "PUT",
                body: JSON.stringify(data)
            });
        } else {
            await maintenanceRequest("/statuses", {
                method: "POST",
                body: JSON.stringify(data)
            });
        }

        toggleModal("statusModal", false);

        await loadMaintenanceData();

    } catch (error) {
        console.error("Status save failed:", error);
        alert(error.message);
    }
}

// Delete an item.
async function deleteItem(type, id) {
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    const endpoints = {
        requests: `/${id}`,
        records: `/records/${id}`,
        statuses: `/statuses/${id}`
    };

    const endpoint = endpoints[type];

    if (!endpoint) {
        alert("Invalid item type.");
        return;
    }

    try {
        await maintenanceRequest(endpoint, {
            method: "DELETE"
        });

        await loadMaintenanceData();

    } catch (error) {
        console.error("Delete failed:", error);
        alert(error.message);
    }
}

// Log out the currently logged-in user.
async function logoutUser() {
    try {
        await apiRequest("/auth/logout", {
            method: "POST"
        });

        window.location.href = "login.html";

    } catch (error) {
        console.error("Logout failed:", error);

        alert("Unable to log out. Please try again.");
    }
}

// Initialize the Maintenance page.
async function initializeMaintenancePage() {

    const profileLoaded = await loadUserProfile();

    if (!profileLoaded) return;

    // Connect the logout button.
    document.getElementById("logoutButton")
        ?.addEventListener("click", logoutUser);

    // IMPORTANT:
    // Forms already use inline onsubmit attributes in maintenance.html.
    // Do not attach another submit listener here.

    // Close modals when clicking the backdrop.
    ["issueModal", "recordModal", "statusModal"].forEach(modalId => {
        const modal = document.getElementById(modalId);

        modal?.addEventListener("click", function (event) {
            if (event.target === modal) {
                toggleModal(modalId, false);
            }
        });
    });

    // Close modals using the Escape key.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAllMaintenanceModals();
        }
    });

    // Load the maintenance tables.
    await loadMaintenanceData();
}

// Start the Maintenance page.
document.addEventListener(
    "DOMContentLoaded",
    initializeMaintenancePage
);