
const db = require("../config/db");

// ==========================================
// MAINTENANCE REQUESTS
// ==========================================

// Get all maintenance requests
async function getAllRequests() {
    const [rows] = await db.query(
        `SELECT
            maintenance_requests.*,
            equipment.equipment_name
         FROM maintenance_requests
         INNER JOIN equipment
            ON maintenance_requests.equipment_id = equipment.equipment_id
         ORDER BY maintenance_requests.id DESC`
    );

    return rows;
}

// Create a maintenance request
async function createRequest(data) {
    const [result] = await db.query(
        `INSERT INTO maintenance_requests
            (equipment_id, description, status)
         VALUES (?, ?, ?)`,
        [
            data.equipment_id,
            data.description,
            data.status || "Pending"
        ]
    );

    return result;
}

// Update a maintenance request
async function updateRequest(id, data) {
    const [result] = await db.query(
        `UPDATE maintenance_requests
         SET description = ?, status = ?
         WHERE id = ?`,
        [data.description, data.status, id]
    );

    return result;
}

// Delete a maintenance request
async function deleteRequest(id) {
    const [result] = await db.query(
        "DELETE FROM maintenance_requests WHERE id = ?",
        [id]
    );

    return result;
}

// ==========================================
// MAINTENANCE RECORDS
// ==========================================

// Get all maintenance records
async function getAllRecords() {
    const [rows] = await db.query(
        `SELECT
            maintenance_records.*,
            maintenance_requests.equipment_id,
            equipment.equipment_name
         FROM maintenance_records
         INNER JOIN maintenance_requests
            ON maintenance_records.request_id = maintenance_requests.id
         INNER JOIN equipment
            ON maintenance_requests.equipment_id = equipment.equipment_id
         ORDER BY maintenance_records.id DESC`
    );

    return rows;
}

// Create a maintenance record
async function createRecord(data) {
    const [result] = await db.query(
        `INSERT INTO maintenance_records
            (request_id, work_performed, technician)
         VALUES (?, ?, ?)`,
        [data.request_id, data.work_performed, data.technician]
    );

    return result;
}

// Update a maintenance record
async function updateRecord(id, data) {
    const [result] = await db.query(
        `UPDATE maintenance_records
         SET work_performed = ?, technician = ?
         WHERE id = ?`,
        [data.work_performed, data.technician, id]
    );

    return result;
}

// Delete a maintenance record
async function deleteRecord(id) {
    const [result] = await db.query(
        "DELETE FROM maintenance_records WHERE id = ?",
        [id]
    );

    return result;
}

// ==========================================
// MAINTENANCE STATUSES
// ==========================================

// Get all maintenance statuses
async function getAllStatuses() {
    const [rows] = await db.query(
        "SELECT * FROM maintenance_statuses ORDER BY id ASC"
    );

    return rows;
}

// Create a maintenance status
async function createStatus(data) {
    const [result] = await db.query(
        `INSERT INTO maintenance_statuses
            (name, description)
         VALUES (?, ?)`,
        [data.name, data.description || null]
    );

    return result;
}

// Update a maintenance status
async function updateStatus(id, data) {
    const [result] = await db.query(
        `UPDATE maintenance_statuses
         SET name = ?, description = ?
         WHERE id = ?`,
        [data.name, data.description || null, id]
    );

    return result;
}

// Delete a maintenance status
async function deleteStatus(id) {
    const [result] = await db.query(
        "DELETE FROM maintenance_statuses WHERE id = ?",
        [id]
    );

    return result;
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    getAllRequests,
    createRequest,
    updateRequest,
    deleteRequest,

    getAllRecords,
    createRecord,
    updateRecord,
    deleteRecord,

    getAllStatuses,
    createStatus,
    updateStatus,
    deleteStatus
};
