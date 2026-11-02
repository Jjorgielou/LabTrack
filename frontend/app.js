const API_URL = '/api/maintenance';

async function fetchEquipment() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const select = document.getElementById('equipment-select');
        
        if (select) {
            select.innerHTML = '<option value="">Select Equipment</option>';
            data.forEach(item => {
                select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
            });
        }
    } catch (err) {
        console.error('Error loading equipment:', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchEquipment);