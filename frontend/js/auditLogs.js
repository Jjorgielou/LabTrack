
document.addEventListener("DOMContentLoaded", async () => {
    const userEmail = document.getElementById("userEmail");
    const avatar = document.querySelector(".user-avatar");
    const logoutButton = document.getElementById("logoutButton");
    const refreshButton = document.getElementById("refreshLogs");
    const tableBody = document.getElementById("logsTableBody");
    const logCount = document.getElementById("logCount");
    const message = document.getElementById("logsMessage");

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[char]);
    }

    try {
        const session = await apiRequest("/auth/me");
        userEmail.textContent = session.user.email;
        avatar.textContent = session.user.email.charAt(0).toUpperCase();
    } catch {
        window.location.href = "login.html";
        return;
    }

    logoutButton.addEventListener("click", async () => {
        try {
            await apiRequest("/auth/logout", { method: "POST" });
            window.location.href = "login.html";
        } catch (error) {
            alert(error.message || "Unable to log out.");
        }
    });

    async function loadLogs() {
        refreshButton.disabled = true;
        message.textContent = "Loading audit logs...";
        message.style.color = "#64748b";

        try {
            const data = await apiRequest("/audit-logs");
            const logs = data.logs || [];

            logCount.textContent = `${logs.length} record(s) found`;
            message.textContent = "";

            if (logs.length === 0) {
                tableBody.innerHTML =
                    '<tr><td colspan="5">No audit records found.</td></tr>';
                return;
            }

            tableBody.innerHTML = logs.map(log => {
                const user = log.email ||
                    [log.first_name, log.last_name].filter(Boolean).join(" ") ||
                    (log.user_id ? `User #${log.user_id}` : "System");

                const date = log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : "N/A";

                return `
                    <tr>
                        <td>${escapeHTML(log.log_id)}</td>
                        <td>${escapeHTML(user)}</td>
                        <td>${escapeHTML(log.action)}</td>
                        <td>${escapeHTML(log.details || "—")}</td>
                        <td>${escapeHTML(date)}</td>
                    </tr>
                `;
            }).join("");

        } catch (error) {
            message.textContent = error.message || "Unable to load audit logs.";
            message.style.color = "#dc2626";
            logCount.textContent = "Unable to load records";
            tableBody.innerHTML =
                '<tr><td colspan="5">Failed to load audit logs.</td></tr>';
        } finally {
            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener("click", loadLogs);
    await loadLogs();
});
