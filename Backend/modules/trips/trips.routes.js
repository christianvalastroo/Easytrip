const express = require("express")
const { createTrip, getTrips, getTripById } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createTrip)
router.get("/", authMiddleware, getTrips)
router.get("/:id", authMiddleware, getTripById)

module.exports = router
