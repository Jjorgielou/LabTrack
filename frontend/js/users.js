
document.addEventListener("DOMContentLoaded", async () => {
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.querySelector(".user-avatar");
    const logoutButton = document.getElementById("logoutButton");

    const tableBody = document.getElementById("usersTableBody");
    const userCount = document.getElementById("userCount");
    const usersMessage = document.getElementById("usersMessage");
    const searchInput = document.getElementById("searchUsers");

    const editSection = document.getElementById("editUserSection");
    const editForm = document.getElementById("editUserForm");
    const editUserId = document.getElementById("editUserId");
    const editFirstName = document.getElementById("editFirstName");
    const editLastName = document.getElementById("editLastName");
    const editEmail = document.getElementById("editEmail");
    const editMessage = document.getElementById("editUserMessage");
    const cancelEditButton = document.getElementById("cancelEditButton");

    let users = [];

    // Verify login session
    try {
        const sessionData = await apiRequest("/auth/me");

        userEmail.textContent = sessionData.user.email;
        userAvatar.textContent =
            sessionData.user.email.charAt(0).toUpperCase();

    } catch (error) {
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

    // Load users
    async function loadUsers() {
        try {
            usersMessage.textContent = "Loading users...";
            usersMessage.style.color = "#64748b";

            const data = await apiRequest("/users");

            users = data.users || [];

            usersMessage.textContent = "";
            displayUsers(users);

        } catch (error) {
            usersMessage.textContent =
                error.message || "Unable to load users.";

            usersMessage.style.color = "#dc2626";
            userCount.textContent = "Unable to load users.";

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">Failed to load users.</td>
                </tr>
            `;
        }
    }

    // Display users
    function displayUsers(userList) {
        userCount.textContent = `${userList.length} user(s) found`;

        if (userList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No users found.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = userList.map(user => {
            const roleIds = {
                "Admin": 1,
                "Laboratory Staff": 2,
                "Student": 3
            };

            return `
                <tr>
                    <td>${escapeHTML(user.user_id)}</td>
                    <td>${escapeHTML(user.first_name)} ${escapeHTML(user.last_name)}</td>
                    <td>${escapeHTML(user.email)}</td>
                    <td>
                        <select class="role-select" data-role-select="${Number(user.user_id)}">
                            <option value="1" ${user.role_name === "Admin" ? "selected" : ""}>Admin</option>
                            <option value="2" ${user.role_name === "Laboratory Staff" ? "selected" : ""}>Laboratory Staff</option>
                            <option value="3" ${user.role_name === "Student" ? "selected" : ""}>Student</option>
                        </select>
                    </td>
                    <td>${user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}</td>
                    <td>
                        <button
                            class="btn-edit"
                            data-action="edit"
                            data-id="${Number(user.user_id)}">
                            Edit
                        </button>

                        <button
                            class="btn-delete"
                            data-action="delete"
                            data-id="${Number(user.user_id)}">
                            Delete
                        </button>

                        <button
                            class="btn-role"
                            data-action="change-role"
                            data-id="${Number(user.user_id)}">
                            Save Role
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Escape displayed database values
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // Search users
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredUsers = users.filter(user => {
            const fullName =
                `${user.first_name} ${user.last_name}`.toLowerCase();

            return fullName.includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
        });

        displayUsers(filteredUsers);
    });

    // Handle Edit and Delete buttons
    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const userId = Number(button.dataset.id);
        const action = button.dataset.action;
        
        // Change user role
        if (action === "change-role") {
            const roleSelect = tableBody.querySelector(
                `[data-role-select="${userId}"]`
            );

            const newRoleId = Number(roleSelect.value);

            const confirmed = confirm(
                `Change ${selectedUser.first_name}'s role to ${roleSelect.options[roleSelect.selectedIndex].text}?`
            );

            if (!confirmed) return;

            button.disabled = true;
            button.textContent = "Saving...";

            try {
                const data = await apiRequest(`/users/${userId}/role`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        role_id: newRoleId
                    })
                });

                usersMessage.style.color = "#16a34a";
                usersMessage.textContent =
                    data.message || "User role updated successfully.";

                await loadUsers();

            } catch (error) {
                alert(error.message || "Unable to change user role.");
                button.disabled = false;
                button.textContent = "Save Role";
            }

            return;
        }

        const selectedUser = users.find(
            user => Number(user.user_id) === userId
        );

        if (!selectedUser) return;

        if (action === "edit") {
            editUserId.value = selectedUser.user_id;
            editFirstName.value = selectedUser.first_name;
            editLastName.value = selectedUser.last_name;
            editEmail.value = selectedUser.email;

            editMessage.textContent = "";
            editSection.hidden = false;

            editSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        if (action === "delete") {
            const confirmed = confirm(
                `Are you sure you want to delete ${selectedUser.first_name} ${selectedUser.last_name}?`
            );

            if (!confirmed) return;

            button.disabled = true;
            button.textContent = "Deleting...";

            try {
                const data = await apiRequest(`/users/${userId}`, {
                    method: "DELETE"
                });

                usersMessage.style.color = "#16a34a";
                usersMessage.textContent =
                    data.message || "User deleted successfully.";

                await loadUsers();

            } catch (error) {
                alert(error.message || "Unable to delete user.");
                button.disabled = false;
                button.textContent = "Delete";
            }
        }
    });

    // Save edited user
    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = editUserId.value;

        const updatedUser = {
            first_name: editFirstName.value.trim(),
            last_name: editLastName.value.trim(),
            email: editEmail.value.trim()
        };

        const saveButton = editForm.querySelector(
            "button[type='submit']"
        );

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        editMessage.textContent = "";

        try {
            const data = await apiRequest(`/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify(updatedUser)
            });

            editMessage.style.color = "#16a34a";
            editMessage.textContent =
                data.message || "User updated successfully.";

            await loadUsers();

            editSection.hidden = true;

        } catch (error) {
            editMessage.style.color = "#dc2626";
            editMessage.textContent =
                error.message || "Unable to update user.";

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";
        }
    });

    // Cancel editing
    cancelEditButton.addEventListener("click", () => {
        editForm.reset();
        editSection.hidden = true;
        editMessage.textContent = "";
    });

    // Initial load
    await loadUsers();
});
