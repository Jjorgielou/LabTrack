
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const submitButton = loginForm.querySelector("button[type='submit']");

        message.textContent = "";
        message.style.color = "#dc2626";

        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            message.style.color = "#16a34a";
            message.textContent = data.message || "Login successful!";

            // Redirect after successful login
            alert("Login successful! Redirecting to dashboard...");
window.location.href = "dashboard.html";

        } catch (error) {
            message.textContent = error.message || "Unable to log in.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Sign In";
        }
    });
}
