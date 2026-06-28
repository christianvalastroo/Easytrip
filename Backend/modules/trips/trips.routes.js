const express = require("express")
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateCreateTrip, validateUpdateTrip, validateTripId } = require("../../middlewares/trips.middlewares")

const router = express.Router()

router.post("/", authMiddleware, validateCreateTrip, createTrip)
router.get("/", authMiddleware, getTrips)
router.get("/:id", authMiddleware, validateTripId, getTripById)
router.put("/:id", authMiddleware, validateTripId, validateUpdateTrip, updateTrip)
router.delete("/:id", authMiddleware, validateTripId, deleteTrip)

module.exports = router
