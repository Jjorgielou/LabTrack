const express = require("express");
const router = express.Router();

const {
    login,
    logout,
    register,
    getMe
} = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.get("/me", getMe);

module.exports = router;