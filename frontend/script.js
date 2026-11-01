const API = "http://localhost:3000/api";
let allLabs = [];

function toggleForm() {
    const form = document.getElementById("addForm");
    if (form.classList.contains("hidden")) {
        form.classList.remove("hidden");
        resetForm();
    } else {
        form.classList.add("hidden");
    }
}

function resetForm() {
    document.getElementById("formTitle").innerText = "Create New Lab";
    document.getElementById("submitBtn").innerText = "Add Laboratory";
    document.getElementById("editId").value = "";
    document.getElementById("lab_name").value = "";
    document.getElementById("location").value = "";
    document.getElementById("capacity").value = "";
    document.getElementById("type_id").value = "1";
    document.getElementById("status_id").value = "1";
}

async function loadLabs() {
    const list = document.getElementById("labList");
    list.innerHTML = "<p class='loading-msg'>Loading laboratories...</p>";
    try {
        const res = await fetch(`${API}/laboratories`);
        const data = await res.json();
        if (data.success) {
            allLabs = data.data;
            renderList(allLabs);
        } else {
            list.innerHTML = `<p class='error-msg'>Error: ${data.error.message}</p>`;
        }
    } catch (err) {
        list.innerHTML = "<p class='error-msg'>Could not connect to server.</p>";
        console.error("Error loading labs:", err);
    }
}

function renderList(labs) {
    const list = document.getElementById("labList");
    list.innerHTML = "";

    if (labs.length === 0) {
        list.innerHTML = "<p>No laboratories found in database.</p>";
        return;
    }

    labs.forEach(lab => {
        const div = document.createElement("div");

        let statusClass = "";
        if (lab.status_name === "Available") statusClass = "available";
        else if (lab.status_name === "Maintenance") statusClass = "maintenance";
        else statusClass = "unavailable";

        div.className = `lab-item ${statusClass}`;
        div.innerHTML = `
            <div>
                <strong>${lab.lab_name}</strong><br>
                <small>Location: ${lab.location} | Capacity: ${lab.capacity}</small>
            </div>
            <div class="btn-group">
                <button class="btn-edit" onclick="editLab(event, ${lab.lab_id})">Edit</button>
                <button class="btn-delete" onclick="deleteLab(event, ${lab.lab_id})">Delete</button>
            </div>
        `;

        div.onclick = () => showStatus(lab);

        list.appendChild(div);
    });
}

function showStatus(lab) {
    const nameDisplay = document.getElementById("selectedName");
    const resultBox = document.getElementById("statusResult");

    nameDisplay.innerText = lab.lab_name;

    resultBox.style.display = "block";
    resultBox.className = "status-box";

    if (lab.status_name === "Available") {
        resultBox.classList.add("status-available");
        resultBox.innerHTML = `AVAILABLE`;
    } else if (lab.status_name === "Maintenance") {
        resultBox.classList.add("status-maintenance");
        resultBox.innerHTML = `UNDER MAINTENANCE`;
    } else {
        resultBox.classList.add("status-unavailable");
        resultBox.innerHTML = `UNAVAILABLE`;
    }
}

async function saveLab() {
    const editId = document.getElementById("editId").value;
    const labName = document.getElementById("lab_name").value.trim();
    const location = document.getElementById("location").value.trim();
    const capacity = Number(document.getElementById("capacity").value);
    const type_id = Number(document.getElementById("type_id").value);
    const status_id = Number(document.getElementById("status_id").value);

    // Validation
    if (!labName || !location || !capacity || !type_id || !status_id) {
        alert("Please fill in all fields.");
        return;
    }

    // Duplicate check (only on POST)
    if (!editId) {
        const duplicate = allLabs.find(l => l.lab_name.toLowerCase() === labName.toLowerCase());
        if (duplicate) {
            alert("Lab already exists with this name.");
            return;
        }
    }

    const body = {
        lab_name: labName,
        location: location,
        capacity: capacity,
        type_id: type_id,
        status_id: status_id
    };

    let url = `${API}/laboratories`;
    let method = "POST";

    if (editId) {
        url = `${API}/laboratories/${editId}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.success) {
        alert(editId ? "Lab updated!" : "Lab added!");
        toggleForm();
        loadLabs();
    } else {
        alert("Error: " + data.error.message);
    }
}

function editLab(event, id) {
    event.stopPropagation();

    const lab = allLabs.find(l => l.lab_id === id);
    if (!lab) return;

    document.getElementById("editId").value = lab.lab_id;
    document.getElementById("lab_name").value = lab.lab_name;
    document.getElementById("location").value = lab.location;
    document.getElementById("capacity").value = lab.capacity;
    document.getElementById("type_id").value = lab.type_id;
    document.getElementById("status_id").value = lab.status_id;
    document.getElementById("formTitle").innerText = "Edit Lab";
    document.getElementById("submitBtn").innerText = "Update Laboratory";
    document.getElementById("addForm").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteLab(event, id) {
    event.stopPropagation();

    if (confirm("Are you sure you want to delete this lab?")) {
        await fetch(`${API}/laboratories/${id}`, { method: "DELETE" });
        loadLabs();
    }
}

document.addEventListener("DOMContentLoaded", loadLabs);