const db = require("../config/db");

// Get all equipment categories
async function getAllCategories() {
    const [rows] = await db.query(
        `SELECT category_id, category_name, description
         FROM equipment_categories
         ORDER BY category_name`
    );

    return rows;
}

// Get one category by ID
async function getCategoryById(categoryId) {
    const [rows] = await db.query(
        `SELECT category_id, category_name, description
         FROM equipment_categories
         WHERE category_id = ?`,
        [categoryId]
    );

    return rows[0];
}

// Create a category
async function createCategory(categoryName, description) {
    const [result] = await db.query(
        `INSERT INTO equipment_categories (category_name, description)
         VALUES (?, ?)`,
        [categoryName, description]
    );

    return result;
}

// Update a category
async function updateCategory(categoryId, categoryName, description) {
    const [result] = await db.query(
        `UPDATE equipment_categories
         SET category_name = ?, description = ?
         WHERE category_id = ?`,
        [categoryName, description, categoryId]
    );

    return result;
}

// Delete a category
async function deleteCategory(categoryId) {
    const [result] = await db.query(
        "DELETE FROM equipment_categories WHERE category_id = ?",
        [categoryId]
    );

    return result;
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};