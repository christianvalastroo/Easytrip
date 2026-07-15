const express = require("express")
const { getCurrentUser, updateCurrentUser, updateCurrentUserPassword, deleteCurrentUser } = require("./users.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateUpdateUser, validateUpdatePassword } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.get("/me", authMiddleware, getCurrentUser)
router.put("/me", authMiddleware, validateUpdateUser, updateCurrentUser)
router.put("/me/password", authMiddleware, validateUpdatePassword, updateCurrentUserPassword)
router.delete("/me", authMiddleware, deleteCurrentUser)

module.exports = router
