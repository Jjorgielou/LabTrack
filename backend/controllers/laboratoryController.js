const labModel = require('../models/laboratoryModel');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, msg, status = 500) => res.status(status).json({ success: false, error: { message: msg } });

const validate = ({ lab_name, location, capacity, type_id, status_id }) =>
  !lab_name || !location || capacity == null || type_id == null || status_id == null;

exports.getAllLabs = async (req, res) => {
  try {
    const labs = await labModel.getAllLabs();
    ok(res, labs);
  } catch (err) { fail(res, err.message); }
};

exports.getUnavailableLabs = async (req, res) => {
  try {
    const labs = await labModel.getUnavailableLabs();
    ok(res, labs);
  } catch (err) { fail(res, err.message); }
};

exports.getLabById = async (req, res) => {
  try {
    const lab = await labModel.getLabById(req.params.id);
    if (!lab) return fail(res, 'Lab not found', 404);
    ok(res, lab);
  } catch (err) { fail(res, err.message); }
};

exports.createLab = async (req, res) => {
  if (validate(req.body)) return fail(res, 'Missing fields', 400);
  const [existing] = await labModel.pool.query(
    'SELECT lab_id FROM laboratories WHERE lab_name = ?',
    [req.body.lab_name]
  );
  if (existing.length > 0) {
    return fail(res, 'Lab already exists', 400);
  }
  try {
    const lab = await labModel.createLab(req.body);
    ok(res, lab, 201);
  } catch (err) { fail(res, err.message); }
};

exports.updateLab = async (req, res) => {
  if (validate(req.body)) return fail(res, 'Missing fields', 400);
  try {
    const updated = await labModel.updateLab(req.params.id, req.body);
    if (!updated) return fail(res, 'Lab not found', 404);
    ok(res, { lab_id: Number(req.params.id), ...req.body });
  } catch (err) { fail(res, err.message); }
};

exports.deleteLab = async (req, res) => {
  try {
    const deleted = await labModel.deleteLab(req.params.id);
    if (!deleted) return fail(res, 'Lab not found', 404);
    res.status(204).send();
  } catch (err) { fail(res, err.message); }
};