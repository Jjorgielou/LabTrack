const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/equipmentCategoryController");

// Everyone must be logged in
router.use(requireAuth);

// Any logged-in user can read
router.get("/", ctrl.getAllCategories);
router.get("/:id", ctrl.getCategoryById);

// Only Admin and Laboratory Staff can change data
router.post("/", requireRole("Admin", "Laboratory Staff"), ctrl.createCategory);
router.put("/:id", requireRole("Admin", "Laboratory Staff"), ctrl.updateCategory);
router.delete("/:id", requireRole("Admin", "Laboratory Staff"), ctrl.deleteCategory);

module.exports = router;