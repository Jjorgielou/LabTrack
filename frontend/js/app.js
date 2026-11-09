async function loadMaintenanceData() {
    try {
        // 1. Requests
        const resReq = await fetch('http://localhost:3000/api/maintenance/requests');
        const requests = await resReq.json();
        const reqBody = document.getElementById('requests-tbody');
        if (reqBody && Array.isArray(requests)) {
            reqBody.innerHTML = requests.map(r => `
                <tr>
                    <td class="px-4 py-2">${r.id}</td>
                    <td class="px-4 py-2">${r.equipment_name || r.equipment_id || ''}</td>
                    <td class="px-4 py-2">${r.problem_description || r.description || ''}</td>
                    <td class="px-4 py-2">${r.status || ''}</td>
                    <td class="px-4 py-2">
                        <button onclick="editItem('requests', ${r.id})" class="text-blue-600 mr-2">Edit</button>
                        <button onclick="deleteItem('requests', ${r.id})" class="text-red-600">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        // 2. Records
        const resRec = await fetch('http://localhost:3000/api/maintenance/records');
        const records = await resRec.json();
        const recBody = document.getElementById('records-tbody');
        if (recBody && Array.isArray(records)) {
            recBody.innerHTML = records.map(rec => `
                <tr>
                    <td class="px-4 py-2">${rec.id}</td>
                    <td class="px-4 py-2">${rec.request_id || ''}</td>
                    <td class="px-4 py-2">${rec.work_performed || rec.description || ''}</td>
                    <td class="px-4 py-2">${rec.technician || ''}</td>
                    <td class="px-4 py-2">
                        <button onclick="editItem('records', ${rec.id})" class="text-blue-600 mr-2">Edit</button>
                        <button onclick="deleteItem('records', ${rec.id})" class="text-red-600">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        // 3. Statuses
        const resStat = await fetch('http://localhost:3000/api/maintenance/statuses');
        const statuses = await resStat.json();
        const statBody = document.getElementById('statuses-tbody');
        if (statBody && Array.isArray(statuses)) {
            statBody.innerHTML = statuses.map(s => `
                <tr>
                    <td class="px-4 py-2">${s.id}</td>
                    <td class="px-4 py-2">${s.status_name || s.name || ''}</td>
                    <td class="px-4 py-2">${s.description || ''}</td>
                    <td class="px-4 py-2">
                        <button onclick="editItem('statuses', ${s.id})" class="text-blue-600 mr-2">Edit</button>
                        <button onclick="deleteItem('statuses', ${s.id})" class="text-red-600">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error('Failed to load maintenance data:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadMaintenanceData);