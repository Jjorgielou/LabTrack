const labModel = require('../models/laboratoryModel');

const ok = (res, data, status = 200) => {
  res.status(status).json({ success: true, data });
};

const fail = (res, msg, status = 500) => {
  res.status(status).json({ success: false, error: { message: msg } });
};

const validate = (body) => {
  const { lab_name, location, capacity, type_id, status_id } = body;

  if (!lab_name || !location || capacity == null || type_id == null || status_id == null) {
    return 'Missing required fields: lab_name, location, capacity, type_id, status_id';
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    return 'Capacity must be a positive integer';
  }

  if (!Number.isInteger(type_id) || type_id <= 0) {
    return 'type_id must be a positive integer';
  }

  if (!Number.isInteger(status_id) || status_id <= 0) {
    return 'status_id must be a positive integer';
  }

  return null;
};

exports.getAllLabs = async (req, res) => {
  try {
    const labs = await labModel.getAllLabs();
    ok(res, labs);
  } catch (err) {
    console.error('Error fetching labs:', err);
    fail(res, 'Failed to fetch laboratories', 500);
  }
};

exports.getUnavailableLabs = async (req, res) => {
  try {
    const labs = await labModel.getUnavailableLabs();
    ok(res, labs);
  } catch (err) {
    console.error('Error fetching unavailable labs:', err);
    fail(res, 'Failed to fetch unavailable laboratories', 500);
  }
};

exports.getLabById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return fail(res, 'Invalid laboratory ID', 400);
    }

    const lab = await labModel.getLabById(id);
    if (!lab) return fail(res, 'Laboratory not found', 404);
    ok(res, lab);
  } catch (err) {
    console.error('Error fetching lab by ID:', err);
    fail(res, 'Failed to fetch laboratory', 500);
  }
};

exports.createLab = async (req, res) => {
  const validationError = validate(req.body);
  if (validationError) {
    return fail(res, validationError, 400);
  }

  try {
    if (await labModel.existsByName(req.body.lab_name)) {
      return fail(res, 'Laboratory with this name already exists', 409);
    }

    const fkCheck = await labModel.validateForeignKeys(req.body.type_id, req.body.status_id);
    if (!fkCheck.valid) {
      return fail(res, fkCheck.message, 400);
    }

    const lab = await labModel.createLab(req.body);
    ok(res, lab, 201);
  } catch (err) {
    console.error('Error creating laboratory:', err);
    fail(res, 'Failed to create laboratory', 500);
  }
};

exports.updateLab = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return fail(res, 'Invalid laboratory ID', 400);
    }

    const validationError = validate(req.body);
    if (validationError) {
      return fail(res, validationError, 400);
    }

    if (await labModel.existsByName(req.body.lab_name, id)) {
      return fail(res, 'Laboratory with this name already exists', 409);
    }

    const fkCheck = await labModel.validateForeignKeys(req.body.type_id, req.body.status_id);
    if (!fkCheck.valid) {
      return fail(res, fkCheck.message, 400);
    }

    const updated = await labModel.updateLab(id, req.body);
    if (!updated) return fail(res, 'Laboratory not found', 404);

    ok(res, updated, 200);
  } catch (err) {
    console.error('Error updating laboratory:', err);
    fail(res, 'Failed to update laboratory', 500);
  }
};

exports.deleteLab = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return fail(res, 'Invalid laboratory ID', 400);
    }

    const deleted = await labModel.deleteLab(id);
    if (!deleted) return fail(res, 'Laboratory not found', 404);

    ok(res, { lab_id: id, deleted: true }, 200);
  } catch (err) {
    console.error('Error deleting laboratory:', err);
    fail(res, 'Failed to delete laboratory', 500);
  }
};