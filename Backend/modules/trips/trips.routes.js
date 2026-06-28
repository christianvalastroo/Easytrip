const express = require("express")
const { createTrip } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createTrip)

module.exports = router