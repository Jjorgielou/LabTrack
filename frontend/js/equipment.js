document.addEventListener("DOMContentLoaded", async () => {
    // ---------- Page elements (IDs come from equipment.html) ----------
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.querySelector(".user-avatar");
    const logoutButton = document.getElementById("logoutButton");

    const equipmentCount = document.getElementById("equipmentCount");
    const equipmentMessage = document.getElementById("equipmentMessage");
    const tableBody = document.getElementById("equipmentTableBody");
    const searchInput = document.getElementById("searchEquipment");
    const filterCategory = document.getElementById("filterCategory");
    const filterAvailability = document.getElementById("filterAvailability");
    const addButton = document.getElementById("addEquipmentButton");

    const formSection = document.getElementById("equipmentFormSection");
    const formTitle = document.getElementById("equipmentFormTitle");
    const form = document.getElementById("equipmentForm");
    const formId = document.getElementById("equipmentId");
    const formName = document.getElementById("equipmentName");
    const formTag = document.getElementById("assetTag");
    const formCategory = document.getElementById("equipmentCategory");
    const formCondition = document.getElementById("equipmentCondition");
    const formStatus = document.getElementById("equipmentStatus");
    const formMessage = document.getElementById("equipmentFormMessage");
    const cancelButton = document.getElementById("cancelEquipmentButton");

    const categorySection = document.getElementById("categorySection");
    const categoryForm = document.getElementById("categoryForm");
    const categoryId = document.getElementById("categoryId");
    const categoryName = document.getElementById("categoryName");
    const categoryDescription = document.getElementById("categoryDescription");
    const categorySaveButton = document.getElementById("categorySaveButton");
    const categoryCancelButton = document.getElementById("categoryCancelButton");
    const categoryMessage = document.getElementById("categoryMessage");
    const categoryTableBody = document.getElementById("categoryTableBody");

    let equipmentList = [];
    let categories = [];
    let canEdit = false; // true only for Admin and Laboratory Staff

    // ---------- Small helpers ----------
    // Stops text from the database being treated as HTML
    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function showMessage(element, text, isError) {
        element.textContent = text;
        element.style.color = isError ? "#dc2626" : "#16a34a";
    }

    // ---------- 1. Check login and role ----------
    try {
        const sessionData = await apiRequest("/auth/me");
        const user = sessionData.user;

        userEmail.textContent = user.email;
        userAvatar.textContent = user.email.charAt(0).toUpperCase();

        canEdit = user.role === "Admin" || user.role === "Laboratory Staff";
    } catch (error) {
        window.location.href = "login.html";
        return;
    }

    // Show the staff-only buttons, headers and sections
    if (canEdit) {
        document.querySelectorAll(".staff-only").forEach((el) => {
            el.hidden = false;
        });
    }

    // ---------- 2. Logout ----------
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Signing out...";
        try {
            await apiRequest("/auth/logout", { method: "POST" });
            window.location.href = "login.html";
        } catch (error) {
            alert(error.message || "Unable to log out.");
            logoutButton.disabled = false;
            logoutButton.textContent = "Sign Out";
        }
    });

    // ---------- 3. Categories ----------
    async function loadCategories() {
        try {
            const result = await apiRequest("/equipment-categories");
            categories = result.data || [];
            fillCategoryDropdowns();
            displayCategories();
        } catch (error) {
            showMessage(equipmentMessage, error.message || "Unable to load categories.", true);
        }
    }

    // Fill the filter dropdown and the form dropdown, keeping the current choice
    function fillCategoryDropdowns() {
        const options = categories
            .map((c) => `<option value="${c.category_id}">${escapeHtml(c.category_name)}</option>`)
            .join("");

        const currentFilter = filterCategory.value;
        filterCategory.innerHTML = `<option value="">All categories</option>${options}`;
        filterCategory.value = currentFilter;

        const currentForm = formCategory.value;
        formCategory.innerHTML = `<option value="">Select a category</option>${options}`;
        formCategory.value = currentForm;
    }

    function displayCategories() {
        if (!canEdit) return;

        if (categories.length === 0) {
            categoryTableBody.innerHTML = `<tr><td colspan="4">No categories yet.</td></tr>`;
            return;
        }

        categoryTableBody.innerHTML = categories.map((c) => `
            <tr>
                <td>${c.category_id}</td>
                <td>${escapeHtml(c.category_name)}</td>
                <td>${escapeHtml(c.description)}</td>
                <td>
                    <button type="button" class="btn-secondary" data-action="edit-category" data-id="${c.category_id}">Edit</button>
                    <button type="button" class="btn-secondary" data-action="delete-category" data-id="${c.category_id}">Delete</button>
                </td>
            </tr>
        `).join("");
    }

    function resetCategoryForm() {
        categoryForm.reset();
        categoryId.value = "";
        categorySaveButton.textContent = "Add Category";
        categoryCancelButton.hidden = true;
    }

    categoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        categoryMessage.textContent = "";

        const body = JSON.stringify({
            category_name: categoryName.value.trim(),
            description: categoryDescription.value.trim()
        });

        const editing = categoryId.value !== "";
        const path = editing
            ? `/equipment-categories/${categoryId.value}`
            : "/equipment-categories";

        try {
            await apiRequest(path, { method: editing ? "PUT" : "POST", body });
            showMessage(categoryMessage, editing ? "Category updated." : "Category added.", false);
            resetCategoryForm();
            await loadCategories();
        } catch (error) {
            showMessage(categoryMessage, error.message || "Unable to save category.", true);
        }
    });

    categoryCancelButton.addEventListener("click", () => {
        resetCategoryForm();
        categoryMessage.textContent = "";
    });

    categoryTableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const category = categories.find((c) => c.category_id === id);
        if (!category) return;

        if (button.dataset.action === "edit-category") {
            categoryId.value = category.category_id;
            categoryName.value = category.category_name;
            categoryDescription.value = category.description || "";
            categorySaveButton.textContent = "Save Category";
            categoryCancelButton.hidden = false;
            categoryName.focus();
        }

        if (button.dataset.action === "delete-category") {
            if (!confirm(`Delete category "${category.category_name}"?`)) return;
            try {
                await apiRequest(`/equipment-categories/${id}`, { method: "DELETE" });
                showMessage(categoryMessage, "Category deleted.", false);
                await loadCategories();
            } catch (error) {
                // For example: category is still in use (409)
                showMessage(categoryMessage, error.message || "Unable to delete category.", true);
            }
        }
    });

    // ---------- 4. Equipment list ----------
    async function loadEquipment() {
        equipmentCount.textContent = "Loading equipment...";
        try {
            // "Unavailable" has its own backend route
            const path = filterAvailability.value === "unavailable"
                ? "/equipment/unavailable"
                : "/equipment";

            const result = await apiRequest(path);
            equipmentList = result.data || [];
            displayEquipment();
        } catch (error) {
            equipmentCount.textContent = "Unable to load equipment.";
            showMessage(equipmentMessage, error.message || "Unable to load equipment.", true);
            tableBody.innerHTML = `<tr><td colspan="7">Failed to load equipment.</td></tr>`;
        }
    }

    // Filters the loaded list in the browser (search, category, available only)
    function displayEquipment() {
        const search = searchInput.value.trim().toLowerCase();
        const category = filterCategory.value;
        const availability = filterAvailability.value;

        const filtered = equipmentList.filter((item) => {
            const matchesSearch =
                item.equipment_name.toLowerCase().includes(search) ||
                item.asset_tag.toLowerCase().includes(search);
            const matchesCategory = category === "" || String(item.category_id) === category;
            const matchesAvailability =
                availability !== "available" ||
                (item.status === "Available" && item.equipment_condition !== "Damaged");

            return matchesSearch && matchesCategory && matchesAvailability;
        });

        equipmentCount.textContent = `${filtered.length} item(s) found`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No equipment found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = filtered.map((item) => `
            <tr>
                <td>${item.equipment_id}</td>
                <td>${escapeHtml(item.equipment_name)}</td>
                <td>${escapeHtml(item.asset_tag)}</td>
                <td>${escapeHtml(item.category_name)}</td>
                <td>${escapeHtml(item.equipment_condition)}</td>
                <td>${escapeHtml(item.status)}</td>
                ${canEdit ? `
                <td>
                    <button type="button" class="btn-secondary" data-action="edit" data-id="${item.equipment_id}">Edit</button>
                    <button type="button" class="btn-secondary" data-action="delete" data-id="${item.equipment_id}">Delete</button>
                </td>` : ""}
            </tr>
        `).join("");
    }

    searchInput.addEventListener("input", displayEquipment);
    filterCategory.addEventListener("change", displayEquipment);
    filterAvailability.addEventListener("change", loadEquipment);

    // ---------- 5. Add / edit form ----------
    function openForm(item) {
        formMessage.textContent = "";
        form.reset();

        if (item) {
            formTitle.textContent = "Edit Equipment";
            formId.value = item.equipment_id;
            formName.value = item.equipment_name;
            formTag.value = item.asset_tag;
            formCategory.value = item.category_id;
            formCondition.value = item.equipment_condition;
            formStatus.value = item.status;
        } else {
            formTitle.textContent = "Add Equipment";
            formId.value = "";
        }

        formSection.hidden = false;
        formSection.scrollIntoView({ behavior: "smooth" });
        formName.focus();
    }

    function closeForm() {
        formSection.hidden = true;
        form.reset();
        formId.value = "";
        formMessage.textContent = "";
    }

    addButton.addEventListener("click", () => openForm(null));
    cancelButton.addEventListener("click", closeForm);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        formMessage.textContent = "";

        // Field names match what backend readEquipmentBody() reads
        const body = JSON.stringify({
            category_id: Number(formCategory.value),
            equipment_name: formName.value.trim(),
            asset_tag: formTag.value.trim(),
            equipment_condition: formCondition.value,
            status: formStatus.value
        });

        const editing = formId.value !== "";
        const path = editing ? `/equipment/${formId.value}` : "/equipment";

        try {
            await apiRequest(path, { method: editing ? "PUT" : "POST", body });
            closeForm();
            showMessage(equipmentMessage, editing ? "Equipment updated." : "Equipment added.", false);
            await loadEquipment();
        } catch (error) {
            // For example: duplicate asset tag (409), bad category (400)
            showMessage(formMessage, error.message || "Unable to save equipment.", true);
        }
    });

    // ---------- 6. Edit / delete buttons in the table ----------
    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const item = equipmentList.find((e) => e.equipment_id === id);
        if (!item) return;

        if (button.dataset.action === "edit") {
            openForm(item);
        }

        if (button.dataset.action === "delete") {
            if (!confirm(`Delete "${item.equipment_name}" (${item.asset_tag})?`)) return;
            try {
                await apiRequest(`/equipment/${id}`, { method: "DELETE" });
                showMessage(equipmentMessage, "Equipment deleted.", false);
                await loadEquipment();
            } catch (error) {
                showMessage(equipmentMessage, error.message || "Unable to delete equipment.", true);
            }
        }
    });

    // ---------- Start ----------
    await loadCategories();
    await loadEquipment();
});
