const express = require("express")
const {
    registerUser,
    loginUser
} = require("./auth.controller")
const {
    validateRegister,
    validateLogin
} = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)
router.post("/login", validateLogin, loginUser)

module.exports = router
