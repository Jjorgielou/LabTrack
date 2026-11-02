const equipmentModel = require("../models/equipmentModel");
const { ok, fail } = require("../utils/response");

const CONDITIONS = ["Good", "Fair", "Damaged"];
const STATUSES = ["Available", "Unavailable", "Under Maintenance"];

// Read and check the :id in the URL
function parseId(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Turn database errors into clear responses
function handleDbError(res, err) {
    if (err.code === "ER_DUP_ENTRY") {
        return fail(res, "CONFLICT", "That asset tag is already in use.", 409);
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return fail(res, "BAD_REQUEST", "That category does not exist.", 400);
    }

    if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return fail(
            res,
            "CONFLICT",
            "This equipment has assignment or maintenance records, so it cannot be deleted. Set its status to Unavailable instead.",
            409
        );
    }

    console.error(err);
    return fail(res, "SERVER_ERROR", "Something went wrong on the server.", 500);
}

// Check the request body
function readEquipmentBody(body) {
    const categoryId = Number(body.category_id);
    const equipmentName = String(body.equipment_name ?? "").trim();
    const assetTag = String(body.asset_tag ?? "").trim();
    const equipmentCondition = body.equipment_condition || "Good";
    const status = body.status || "Available";

    if (!Number.isInteger(categoryId) || categoryId < 1) {
        return { error: "A valid category is required." };
    }

    if (!equipmentName) {
        return { error: "Equipment name is required." };
    }

    if (equipmentName.length > 100) {
        return { error: "Equipment name must be 100 characters or fewer." };
    }

    if (!assetTag) {
        return { error: "Asset tag is required." };
    }

    if (assetTag.length > 50) {
        return { error: "Asset tag must be 50 characters or fewer." };
    }

    if (!CONDITIONS.includes(equipmentCondition)) {
        return { error: `Condition must be one of: ${CONDITIONS.join(", ")}.` };
    }

    if (!STATUSES.includes(status)) {
        return { error: `Status must be one of: ${STATUSES.join(", ")}.` };
    }

    return { categoryId, equipmentName, assetTag, equipmentCondition, status };
}

async function getAllEquipment(req, res) {
    try {
        const equipment = await equipmentModel.getAllEquipment();
        ok(res, equipment);
    } catch (err) {
        handleDbError(res, err);
    }
}

// Equipment that is unavailable, under maintenance, or damaged
async function getUnavailableEquipment(req, res) {
    try {
        const equipment = await equipmentModel.getUnavailableEquipment();
        ok(res, equipment);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function getEquipmentById(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid equipment id.", 400);

    try {
        const item = await equipmentModel.getEquipmentById(id);
        if (!item) return fail(res, "NOT_FOUND", "Equipment not found.", 404);
        ok(res, item);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function createEquipment(req, res) {
    const data = readEquipmentBody(req.body || {});
    if (data.error) return fail(res, "BAD_REQUEST", data.error, 400);

    try {
        const result = await equipmentModel.createEquipment(
            data.categoryId,
            data.equipmentName,
            data.assetTag,
            data.equipmentCondition,
            data.status
        );
        const created = await equipmentModel.getEquipmentById(result.insertId);
        ok(res, created, 201);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function updateEquipment(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid equipment id.", 400);

    const data = readEquipmentBody(req.body || {});
    if (data.error) return fail(res, "BAD_REQUEST", data.error, 400);

    try {
        const result = await equipmentModel.updateEquipment(
            id,
            data.categoryId,
            data.equipmentName,
            data.assetTag,
            data.equipmentCondition,
            data.status
        );
        if (result.affectedRows === 0) return fail(res, "NOT_FOUND", "Equipment not found.", 404);
        const updated = await equipmentModel.getEquipmentById(id);
        ok(res, updated);
    } catch (err) {
        handleDbError(res, err);
    }
}

async function deleteEquipment(req, res) {
    const id = parseId(req);
    if (!id) return fail(res, "BAD_REQUEST", "Invalid equipment id.", 400);

    try {
        const result = await equipmentModel.deleteEquipment(id);
        if (result.affectedRows === 0) return fail(res, "NOT_FOUND", "Equipment not found.", 404);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
}

module.exports = {
    getAllEquipment,
    getUnavailableEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment
};