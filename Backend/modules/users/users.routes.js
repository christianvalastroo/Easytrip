const express = require("express")
const { registerUser, loginUser, getUserById, getCurrentUser, deleteCurrentUser } = require("./users.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateRegister } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)
router.post("/login", loginUser)
router.get("/me", authMiddleware, getCurrentUser)
router.delete("/me", authMiddleware, deleteCurrentUser)
router.get("/:id", getUserById)

module.exports = router
