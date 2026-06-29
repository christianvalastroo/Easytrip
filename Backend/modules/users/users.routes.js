const express = require("express")
const { getCurrentUser, updateCurrentUser, deleteCurrentUser } = require("./users.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateUpdateUser } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.get("/me", authMiddleware, getCurrentUser)
router.put("/me", authMiddleware, validateUpdateUser, updateCurrentUser)
router.delete("/me", authMiddleware, deleteCurrentUser)

module.exports = router
