const express = require("express")
const { registerUser, loginUser, getUserById, getCurrentUser, updateCurrentUser, deleteCurrentUser } = require("./users.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateRegister, validateLogin, validateUpdateUser } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)
router.post("/login", validateLogin, loginUser)
router.get("/me", authMiddleware, getCurrentUser)
router.put("/me", authMiddleware, validateUpdateUser, updateCurrentUser)
router.delete("/me", authMiddleware, deleteCurrentUser)
router.get("/:id", getUserById)

module.exports = router
