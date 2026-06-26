const express = require("express")
const { registerUser, loginUser, getUserById } = require("./users.controller")
const { validateRegister } = require("../../middlewares/users.middlewares")

const router = express.Router()

router.post("/register", validateRegister, registerUser)
router.post("/login", loginUser)
router.get("/:id", getUserById)

module.exports = router
