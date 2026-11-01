
document.addEventListener("DOMContentLoaded", async () => {
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.querySelector(".user-avatar");
    const logoutButton = document.getElementById("logoutButton");

    // Check login session
    try {
        const data = await apiRequest("/auth/me");

        userEmail.textContent = data.user.email;
        userAvatar.textContent = data.user.email.charAt(0).toUpperCase();

        console.log("Logged-in user:", data.user);

    } catch (error) {
        console.error("Session check failed:", error.message);
        window.location.href = "login.html";
        return;
    }

    // Logout button
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
