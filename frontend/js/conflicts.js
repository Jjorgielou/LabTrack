document.addEventListener("DOMContentLoaded", async () => {
    const conflictForm = document.getElementById("conflictForm");
    const formMessage = document.getElementById("conflictFormMessage");
    const listMessage = document.getElementById("conflictListMessage");
    const tableBody = document.getElementById("conflictsTableBody");
    const submitButton = document.getElementById("submitConflictButton");

    let conflicts = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function showMessage(element, message, success = false) {
        element.textContent = message;
        element.style.color = success ? "#16a34a" : "#dc2626";
    }

    // Check the current session and role
    let currentUser;

    try {
        const session = await apiRequest("/auth/me");
        currentUser = session.user;
    } catch (error) {
        window.location.href = "login.html";
        return;
    }

    const canReport = ["Admin", "Laboratory Staff"].includes(currentUser.role);
    const isAdmin = currentUser.role === "Admin";

    if (!canReport) {
        conflictForm.closest("section").hidden = true;
    }

    async function loadConflicts() {
        try {
            listMessage.textContent = "Loading conflict records...";

            const response = await apiRequest("/conflicts/conflicts");
            conflicts = response.data || [];

            displayConflicts(conflicts);
            listMessage.textContent =
                `${conflicts.length} conflict record(s) found.`;
            listMessage.style.color = "#64748b";

        } catch (error) {
            listMessage.textContent =
                error.message || "Unable to load conflict records.";
            listMessage.style.color = "#dc2626";
        }
    }

    function displayConflicts(records) {
        if (!records.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No conflict records found.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = records.map(conflict => {
            const status = conflict.conflict_status || "detected";

            const statusControl = canReport
                ? `
                    <select
                        class="status-select"
                        data-status-id="${Number(conflict.conflict_id)}"
                    >
                        <option value="detected" ${status === "detected" ? "selected" : ""}>Detected</option>
                        <option value="reviewed" ${status === "reviewed" ? "selected" : ""}>Reviewed</option>
                        <option value="resolved" ${status === "resolved" ? "selected" : ""}>Resolved</option>
                        <option value="dismissed" ${status === "dismissed" ? "selected" : ""}>Dismissed</option>
                    </select>
                `
                : escapeHTML(status);

            const deleteButton = isAdmin
                ? `
                    <button
                        class="danger-button"
                        data-action="delete"
                        data-id="${Number(conflict.conflict_id)}"
                    >
                        Delete
                    </button>
                `
                : "";

            return `
                <tr>
                    <td>${Number(conflict.conflict_id)}</td>
                    <td>
                        ${Number(conflict.booking_id)}
                        / ${Number(conflict.conflict_booking_id)}
                    </td>
                    <td>${escapeHTML(conflict.lab_name || conflict.lab_id)}</td>
                    <td>${escapeHTML(conflict.conflict_type)}</td>
                    <td>${statusControl}</td>
                    <td>
                        ${conflict.detected_at
                            ? new Date(conflict.detected_at).toLocaleString()
                            : "N/A"}
                    </td>
                    <td>
                        <div class="actions">
                            ${canReport ? `
                                <button
                                    class="primary-button"
                                    data-action="update"
                                    data-id="${Number(conflict.conflict_id)}"
                                >
                                    Save Status
                                </button>
                            ` : ""}
                            ${deleteButton}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Submit a conflict report
    conflictForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (!canReport) return;

        const bookingId = Number(
            document.getElementById("bookingId").value
        );

        const conflictBookingId = Number(
            document.getElementById("conflictBookingId").value
        );

        const labId = Number(
            document.getElementById("labId").value
        );

        const conflictType =
            document.getElementById("conflictType").value.trim();

        const description =
            document.getElementById("description").value.trim();

        if (
            !Number.isInteger(bookingId) || bookingId < 1 ||
            !Number.isInteger(conflictBookingId) || conflictBookingId < 1 ||
            !Number.isInteger(labId) || labId < 1
        ) {
            showMessage(formMessage, "Enter valid positive IDs.");
            return;
        }

        if (bookingId === conflictBookingId) {
            showMessage(
                formMessage,
                "The two booking IDs must be different."
            );
            return;
        }

        if (!conflictType) {
            showMessage(formMessage, "Conflict type is required.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            const response = await apiRequest("/conflicts/conflicts", {
                method: "POST",
                body: JSON.stringify({
                    booking_id: bookingId,
                    conflict_booking_id: conflictBookingId,
                    lab_id: labId,
                    conflict_type: conflictType,
                    description
                })
            });

            showMessage(
                formMessage,
                response.message || "Conflict report created successfully.",
                true
            );

            conflictForm.reset();
            await loadConflicts();

        } catch (error) {
            showMessage(
                formMessage,
                error.message || "Unable to submit conflict report."
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Conflict Report";
        }
    });

    // Update conflict status or delete a record
    tableBody.addEventListener("click", async event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const conflictId = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "update") {
            if (!canReport) return;

            const statusSelect = tableBody.querySelector(
                `[data-status-id="${conflictId}"]`
            );

            if (!statusSelect) return;

            const newStatus = statusSelect.value;

            button.disabled = true;
            button.textContent = "Saving...";

            try {
                const response = await apiRequest(
                    `/conflicts/conflicts/${conflictId}/status`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            conflict_status: newStatus
                        })
                    }
                );

                showMessage(
                    listMessage,
                    response.message || "Conflict status updated.",
                    true
                );

                await loadConflicts();

            } catch (error) {
                showMessage(
                    listMessage,
                    error.message || "Unable to update conflict status."
                );
                button.disabled = false;
                button.textContent = "Save Status";
            }

            return;
        }

        if (action === "delete") {
            if (!isAdmin) return;

            if (!confirm("Are you sure you want to delete this conflict record?")) {
                return;
            }

            button.disabled = true;
            button.textContent = "Deleting...";

            try {
                const response = await apiRequest(
                    `/conflicts/conflicts/${conflictId}`,
                    { method: "DELETE" }
                );

                showMessage(
                    listMessage,
                    response.message || "Conflict record deleted.",
                    true
                );

                await loadConflicts();

            } catch (error) {
                showMessage(
                    listMessage,
                    error.message || "Unable to delete conflict record."
                );
                button.disabled = false;
                button.textContent = "Delete";
            }
        }
    });

    await loadConflicts();
});
