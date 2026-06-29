const express = require("express")
const { createActivity } = require("./activities.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createActivity)

module.exports = router
