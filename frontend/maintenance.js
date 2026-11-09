async function loadMaintenanceData() {
    try {
        // 1. Fetch & Populate Requests
        const resReq = await fetch('http://localhost:3000/api/maintenance/requests');
        const requests = await resReq.json();
        const reqBody = document.getElementById('requests-tbody'); // Ensure your <tbody> has this ID
        if (reqBody && Array.isArray(requests)) {
            reqBody.innerHTML = requests.map(r => `
                <tr>
                    <td class="px-4 py-2">${r.id}</td>
                    <td class="px-4 py-2">${r.equipment_name || r.equipment_id}</td>
                    <td class="px-4 py-2">${r.problem_description}</td>
                    <td class="px-4 py-2">${r.status}</td>
                    <td class="px-4 py-2">...actions...</td>
                </tr>
            `).join('');
        }

        // Repeat for records and statuses endpoints as needed (/api/maintenance/records, /api/maintenance/statuses)

    } catch (err) {
        console.error('Failed to load maintenance data:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadMaintenanceData);