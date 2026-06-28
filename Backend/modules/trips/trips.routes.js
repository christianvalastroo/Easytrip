const express = require("express")
const { createTrip, getTrips } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createTrip)
router.get("/", authMiddleware, getTrips)

module.exports = router
