const express = require("express")
const { registerUser } = require("./users.controller")
const { validateRegister } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)

module.exports = router