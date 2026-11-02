// backend/controllers/laboratoryController.js

const Lab = require('../models/laboratoryModel');

const ok = (res, data, status = 200) => res.status(status).json({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    count: Array.isArray(data) ? data.length : 1
  }
});

const fail = (res, code, message, status) =>
  res.status(status).json({ success: false, error: { code, message } });

const serverError = (res, err) => {
  console.error('[laboratories]', err);
  return fail(res, 'SERVER_ERROR', 'An unexpected server error occurred.', 500);
};

const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

const isValidIdParam = (v) => /^\d+$/.test(String(v)) && Number(v) > 0;

const validatePayload = ({ lab_name, location, capacity, type_id, status_id }) => {
  if (!lab_name || typeof lab_name !== 'string' || !lab_name.trim())
    return 'lab_name is required.';
  if (!location || typeof location !== 'string' || !location.trim())
    return 'location is required.';
  if (capacity === undefined || capacity === null || !isPositiveInt(capacity))
    return 'capacity must be a positive integer.';
  if (!isPositiveInt(type_id))
    return 'type_id must be a positive integer.';
  if (!isPositiveInt(status_id))
    return 'status_id must be a positive integer.';
  return null;
};

exports.getAllLabs = async (_req, res) => {
  try {
    ok(res, await Lab.getAllLabs());
  } catch (err) {
    serverError(res, err);
  }
};

exports.getUnavailableLabs = async (_req, res) => {
  try {
    ok(res, await Lab.getUnavailableLabs());
  } catch (err) {
    serverError(res, err);
  }
};

exports.getLabById = async (req, res) => {
  try {
    if (!isValidIdParam(req.params.id))
      return fail(res, 'BAD_REQUEST', 'Invalid laboratory ID.', 400);

    const lab = await Lab.getLabById(req.params.id);
    if (!lab) return fail(res, 'NOT_FOUND', 'Laboratory not found.', 404);
    ok(res, lab);
  } catch (err) {
    serverError(res, err);
  }
};

exports.createLab = async (req, res) => {
  try {
    const problem = validatePayload(req.body);
    if (problem) return fail(res, 'BAD_REQUEST', problem, 400);

    const { lab_name, location, capacity, type_id, status_id } = req.body;

    const fk = await Lab.validateForeignKeys(type_id, status_id);
    if (!fk.valid) return fail(res, 'BAD_REQUEST', fk.message, 400);

    if (await Lab.existsByName(lab_name.trim()))
      return fail(res, 'CONFLICT', 'A laboratory with that name already exists.', 409);

    const created = await Lab.createLab({
      lab_name: lab_name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      type_id: Number(type_id),
      status_id: Number(status_id)
    });

    ok(res, created, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return fail(res, 'CONFLICT', 'A laboratory with that name already exists.', 409);
    serverError(res, err);
  }
};

exports.updateLab = async (req, res) => {
  try {
    if (!isValidIdParam(req.params.id))
      return fail(res, 'BAD_REQUEST', 'Invalid laboratory ID.', 400);

    const problem = validatePayload(req.body);
    if (problem) return fail(res, 'BAD_REQUEST', problem, 400);

    const { lab_name, location, capacity, type_id, status_id } = req.body;

    const fk = await Lab.validateForeignKeys(type_id, status_id);
    if (!fk.valid) return fail(res, 'BAD_REQUEST', fk.message, 400);

    if (await Lab.existsByName(lab_name.trim(), req.params.id))
      return fail(res, 'CONFLICT', 'Another laboratory already uses that name.', 409);

    const updated = await Lab.updateLab(req.params.id, {
      lab_name: lab_name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      type_id: Number(type_id),
      status_id: Number(status_id)
    });

    if (!updated) return fail(res, 'NOT_FOUND', 'Laboratory not found.', 404);
    ok(res, updated);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return fail(res, 'CONFLICT', 'Another laboratory already uses that name.', 409);
    serverError(res, err);
  }
};

exports.deleteLab = async (req, res) => {
  try {
    if (!isValidIdParam(req.params.id))
      return fail(res, 'BAD_REQUEST', 'Invalid laboratory ID.', 400);

    const deleted = await Lab.deleteLab(req.params.id);
    if (!deleted) return fail(res, 'NOT_FOUND', 'Laboratory not found.', 404);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return fail(res, 'CONFLICT', 'This laboratory has related records and cannot be deleted.', 409);
    serverError(res, err);
  }
};