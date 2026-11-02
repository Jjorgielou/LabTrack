const db = require("../config/db");

// Shared SELECT: equipment joined with its category name
const EQUIPMENT_SELECT = `
    SELECT
        equipment.equipment_id,
        equipment.category_id,
        equipment_categories.category_name,
        equipment.equipment_name,
        equipment.asset_tag,
        equipment.equipment_condition,
        equipment.status,
        equipment.created_at
    FROM equipment
    INNER JOIN equipment_categories
        ON equipment.category_id = equipment_categories.category_id`;

// Get all equipment
async function getAllEquipment() {
    const [rows] = await db.query(
        `${EQUIPMENT_SELECT}
         ORDER BY equipment.equipment_id DESC`
    );

    return rows;
}

// Get one equipment item by ID
async function getEquipmentById(equipmentId) {
    const [rows] = await db.query(
        `${EQUIPMENT_SELECT}
         WHERE equipment.equipment_id = ?`,
        [equipmentId]
    );

    return rows[0];
}

// Equipment that cannot be used: unavailable, under maintenance, or damaged
async function getUnavailableEquipment() {
    const [rows] = await db.query(
        `${EQUIPMENT_SELECT}
         WHERE equipment.status <> 'Available'
            OR equipment.equipment_condition = 'Damaged'
         ORDER BY equipment.equipment_id DESC`
    );

    return rows;
}

// Create equipment
async function createEquipment(categoryId, equipmentName, assetTag, equipmentCondition, status) {
    const [result] = await db.query(
        `INSERT INTO equipment
            (category_id, equipment_name, asset_tag, equipment_condition, status)
         VALUES (?, ?, ?, ?, ?)`,
        [categoryId, equipmentName, assetTag, equipmentCondition, status]
    );

    return result;
}

// Update equipment
async function updateEquipment(equipmentId, categoryId, equipmentName, assetTag, equipmentCondition, status) {
    const [result] = await db.query(
        `UPDATE equipment
         SET category_id = ?, equipment_name = ?, asset_tag = ?,
             equipment_condition = ?, status = ?
         WHERE equipment_id = ?`,
        [categoryId, equipmentName, assetTag, equipmentCondition, status, equipmentId]
    );

    return result;
}

// Delete equipment
async function deleteEquipment(equipmentId) {
    const [result] = await db.query(
        "DELETE FROM equipment WHERE equipment_id = ?",
        [equipmentId]
    );

    return result;
}

module.exports = {
    getAllEquipment,
    getEquipmentById,
    getUnavailableEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment
};