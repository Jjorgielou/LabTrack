const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser
} = require("../controllers/userController");

// All user-management routes require an Admin session
router.use(requireAuth, requireRole("Admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
