const express = require("express")
const {
    getCurrentUser,
    updateCurrentUser,
    updateCurrentUserPassword,
    updateCurrentUserAvatar,
    deleteCurrentUser
} = require("./users.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const upload = require("../../middlewares/upload.middleware")
const { validateUpdateUser, validateUpdatePassword } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.get("/me", authMiddleware, getCurrentUser)
router.put("/me", authMiddleware, validateUpdateUser, updateCurrentUser)
router.put("/me/password", authMiddleware, validateUpdatePassword, updateCurrentUserPassword)
router.put("/me/avatar", authMiddleware, upload.single("avatar"), updateCurrentUserAvatar)
router.delete("/me", authMiddleware, deleteCurrentUser)

module.exports = router
