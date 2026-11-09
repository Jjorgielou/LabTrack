const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/equipmentController");

// Everyone must be logged in
router.use(requireAuth);

// Any logged-in user can read
router.get("/", ctrl.getAllEquipment);
router.get("/unavailable", ctrl.getUnavailableEquipment);
router.get("/coverage", ctrl.getEquipmentCoverage); // must stay above "/:id"
router.get("/:id", ctrl.getEquipmentById);

// Only Admin and Laboratory Staff can change data
router.post("/", requireRole("Admin", "Laboratory Staff"), ctrl.createEquipment);
router.put("/:id", requireRole("Admin", "Laboratory Staff"), ctrl.updateEquipment);
router.delete("/:id", requireRole("Admin", "Laboratory Staff"), ctrl.deleteEquipment);

module.exports = router;