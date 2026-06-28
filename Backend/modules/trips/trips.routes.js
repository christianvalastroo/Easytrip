const express = require("express")
const { createTrip, getTrips, getTripById, updateTrip } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createTrip)
router.get("/", authMiddleware, getTrips)
router.get("/:id", authMiddleware, getTripById)
router.put("/:id", authMiddleware, updateTrip)

module.exports = router
