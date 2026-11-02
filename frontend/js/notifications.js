document.addEventListener("DOMContentLoaded", async () => {
    const notificationForm = document.getElementById("notificationForm");
    const formMessage = document.getElementById("notificationFormMessage");
    const listMessage = document.getElementById("notificationListMessage");
    const tableBody = document.getElementById("notificationsTableBody");
    const submitButton = document.getElementById("submitNotificationButton");
    const createSection = document.getElementById("createNotificationSection");

    let currentUser;

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

    // Verify login session
    try {
        const session = await apiRequest("/auth/me");
        currentUser = session.user;
    } catch (error) {
        window.location.href = "login.html";
        return;
    }

    const canCreate = ["Admin", "Laboratory Staff"].includes(currentUser.role);
    const isAdmin = currentUser.role === "Admin";

    // Students can view their own notifications only.
    if (!canCreate) {
        createSection.hidden = true;
    }

    async function loadNotifications() {
        try {
            listMessage.textContent = "Loading notifications...";

            const endpoint = isAdmin || currentUser.role === "Laboratory Staff"
                ? "/conflicts/notifications"
                : "/conflicts/notifications/mine";

            const response = await apiRequest(endpoint);
            const notifications = response.data || [];

            displayNotifications(notifications);

            listMessage.textContent =
                `${notifications.length} notification(s) found.`;
            listMessage.style.color = "#64748b";

        } catch (error) {
            listMessage.textContent =
                error.message || "Unable to load notifications.";
            listMessage.style.color = "#dc2626";
        }
    }

    function displayNotifications(notifications) {
        if (notifications.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No notifications found.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = notifications.map(notification => {
            const recipient = notification.first_name
                ? `${notification.first_name} ${notification.last_name}`
                : `User #${notification.user_id}`;

            return `
                <tr>
                    <td>${Number(notification.notification_id)}</td>
                    <td>${escapeHTML(recipient)}</td>
                    <td>${escapeHTML(notification.message)}</td>
                    <td>${escapeHTML(notification.notification_type)}</td>
                    <td>
                        ${notification.booking_id == null
                            ? "N/A"
                            : Number(notification.booking_id)}
                    </td>
                    <td>
                        ${notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : "N/A"}
                    </td>
                    <td>
                        ${isAdmin ? `
                            <button
                                class="danger-button"
                                data-action="delete"
                                data-id="${Number(notification.notification_id)}"
                            >
                                Delete
                            </button>
                        ` : "—"}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Create notification
    notificationForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (!canCreate) return;

        const userId = Number(
            document.getElementById("notificationUserId").value
        );

        const notificationType =
            document.getElementById("notificationType").value.trim();

        const message =
            document.getElementById("notificationMessage").value.trim();

        const bookingIdValue =
            document.getElementById("notificationBookingId").value.trim();

        const bookingId = bookingIdValue === ""
            ? null
            : Number(bookingIdValue);

        if (!Number.isInteger(userId) || userId < 1) {
            showMessage(formMessage, "Enter a valid recipient User ID.");
            return;
        }

        if (!notificationType || !message) {
            showMessage(formMessage, "Notification type and message are required.");
            return;
        }

        if (
            bookingId !== null &&
            (!Number.isInteger(bookingId) || bookingId < 1)
        ) {
            showMessage(formMessage, "Enter a valid Booking ID or leave it empty.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            const response = await apiRequest("/conflicts/notifications", {
                method: "POST",
                body: JSON.stringify({
                    user_id: userId,
                    message,
                    notification_type: notificationType,
                    booking_id: bookingId
                })
            });

            showMessage(
                formMessage,
                response.message || "Notification created successfully.",
                true
            );

            notificationForm.reset();
            await loadNotifications();

        } catch (error) {
            showMessage(
                formMessage,
                error.message || "Unable to create notification."
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Notification";
        }
    });

    // Delete notification (Admin only)
    tableBody.addEventListener("click", async event => {
        const button = event.target.closest("button[data-action='delete']");

        if (!button || !isAdmin) return;

        const notificationId = Number(button.dataset.id);

        if (!confirm("Are you sure you want to delete this notification?")) {
            return;
        }

        button.disabled = true;
        button.textContent = "Deleting...";

        try {
            const response = await apiRequest(
                `/conflicts/notifications/${notificationId}`,
                {
                    method: "DELETE"
                }
            );

            showMessage(
                listMessage,
                response.message || "Notification deleted successfully.",
                true
            );

            await loadNotifications();

        } catch (error) {
            showMessage(
                listMessage,
                error.message || "Unable to delete notification."
            );

            button.disabled = false;
            button.textContent = "Delete";
        }
    });

    await loadNotifications();
});
