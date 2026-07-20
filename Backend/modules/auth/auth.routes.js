const express = require("express")
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} = require("./auth.controller")
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)
router.post("/login", validateLogin, loginUser)
router.post("/forgot-password", validateForgotPassword, forgotPassword)
router.post("/reset-password", validateResetPassword, resetPassword)

module.exports = router
