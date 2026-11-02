const categoryModel = require("../models/equipmentCategoryModel");
const { ok, fail } = require("../utils/response");

// Read and check the :id in the URL
function parseId(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Turn database errors into clear responses
function handleDbError(res, err) {
    if (err.code === "ER_DUP_ENTRY") {
        return fail(res, "CONFLICT", "A category with that name already exists.", 409);
    }

    if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return fail(res, "CONFLICT", "This category is still used by equipment, so it cannot be deleted.", 409);
    }

    console.error(err);
    return fail(res, "SERVER_ERROR", "Something went wrong on the server.", 500);
}

// Check the request body
function readCategoryBody(body) {
    const categoryName = String(body.category_name ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!categoryName) {
        return { error: "Category name is required." };
    }

    if (categoryName.length > 100) {
        return { error: "Category name must be 100 characters or fewer." };
    }

    if (description.length > 255) {
        return { error: "Description must be 255 characters or fewer." };
    }

    return { categoryName, description: description || null };
}

async function getAllCategories(req, res) {
    try {
        const categories = await categoryModel.getAllCategories();
        ok(res, categories);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function getCategoryById(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid category id.", 400);

    try {
        const category = await categoryModel.getCategoryById(id);
        if (!category) return fail(res, "NOT_FOUND", "Category not found.", 404);
        ok(res, category);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function createCategory(req, res) {
    const { error, categoryName, description } = readCategoryBody(req.body || {});
    if (error) return fail(res, "BAD_REQUEST", error, 400);

    try {
        const result = await categoryModel.createCategory(categoryName, description);
        const created = await categoryModel.getCategoryById(result.insertId);
        ok(res, created, 201);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function updateCategory(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid category id.", 400);

    const { error, categoryName, description } = readCategoryBody(req.body || {});
    if (error) return fail(res, "BAD_REQUEST", error, 400);

    try {
        const result = await categoryModel.updateCategory(id, categoryName, description);
        if (result.affectedRows === 0) return fail(res, "NOT_FOUND", "Category not found.", 404);
        const updated = await categoryModel.getCategoryById(id);
        ok(res, updated);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function deleteCategory(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid category id.", 400);

    try {
        const result = await categoryModel.deleteCategory(id);
        if (result.affectedRows === 0) return fail(res, "NOT_FOUND", "Category not found.", 404);
         ok(res, { deleted: true });
    } catch (err) {
        handleDbError(res, err);
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};