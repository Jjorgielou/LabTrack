document.addEventListener("DOMContentLoaded", async () => {
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.querySelector(".user-avatar");
    const logoutButton = document.getElementById("logoutButton");

    // Check login session
    try {
        const data = await apiRequest("/auth/me");

        userEmail.textContent = data.user.email;
        userAvatar.textContent = data.user.email.charAt(0).toUpperCase();

    } catch (error) {
        console.error("Session check failed:", error.message);
        window.location.href = "login.html";
        return;
    }

    // Load dashboard statistics and recent activity
    async function loadDashboardStats() {
        try {
            const data = await apiRequest("/dashboard/stats");
            const stats = data.stats;

            document.getElementById("totalUsers").textContent =
                stats.totalUsers;

            document.getElementById("totalAdmins").textContent =
                stats.totalAdmins;

            // Display recent activity
            const activityContainer =
                document.getElementById("recentActivity");

            const activities = data.recentActivity || [];

            if (activities.length === 0) {
                activityContainer.textContent =
                    "No recent activity to display.";
                return;
            }

            activityContainer.innerHTML = activities.map(activity => {
                const name = activity.first_name
                    ? `${activity.first_name} ${activity.last_name}`
                    : activity.email || "System";

                const date = activity.created_at
                    ? new Date(activity.created_at).toLocaleString()
                    : "N/A";

                return `
                    <div class="activity-item">
                        <div>
                            <strong>${escapeHTML(activity.action)}</strong>
                            <p>${escapeHTML(name)}</p>
                            <small>${escapeHTML(activity.details || "")}</small>
                        </div>
                        <small>${escapeHTML(date)}</small>
                    </div>
                `;
            }).join("");

        } catch (error) {
            console.error("Dashboard statistics failed:", error.message);

            document.getElementById("totalUsers").textContent = "—";
            document.getElementById("totalAdmins").textContent = "—";

            document.getElementById("recentActivity").textContent =
                "Unable to load recent activity.";
        }
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

    await loadDashboardStats();

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
});
