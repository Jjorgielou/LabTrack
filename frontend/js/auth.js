document.addEventListener("DOMContentLoaded", () => {

    // LOGIN
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const message = document.getElementById("loginMessage");
            const button = loginForm.querySelector("button[type='submit']");

            message.textContent = "";
            message.style.color = "#dc2626";

            button.disabled = true;
            button.textContent = "Signing in...";

            try {
                const data = await apiRequest("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                message.style.color = "#16a34a";
                message.textContent = data.message || "Login successful!";

                window.location.href = "dashboard.html";

            } catch (error) {
                message.textContent = error.message || "Unable to log in.";
            } finally {
                button.disabled = false;
                button.textContent = "Sign In";
            }
        });
    }

    // REGISTRATION
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const first_name = document.getElementById("first_name").value.trim();
            const last_name = document.getElementById("last_name").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;

            const message = document.getElementById("registerMessage");
            const button = registerForm.querySelector("button[type='submit']");

            message.textContent = "";
            message.style.color = "#dc2626";

            button.disabled = true;
            button.textContent = "Creating account...";

            try {
                const data = await apiRequest("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        first_name,
                        last_name,
                        email,
                        password
                    })
                });

                message.style.color = "#16a34a";
                message.textContent = data.message || "Account created successfully!";

                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } catch (error) {
                message.textContent = error.message || "Unable to register.";
            } finally {
                button.disabled = false;
                button.textContent = "Create Account";
            }
        });
    }

});
