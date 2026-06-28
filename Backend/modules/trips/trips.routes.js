const express = require("express")
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateCreateTrip, validateUpdateTrip } = require("../../middlewares/trips.middlewares")

const router = express.Router()

router.post("/", authMiddleware, validateCreateTrip, createTrip)
router.get("/", authMiddleware, getTrips)
router.get("/:id", authMiddleware, getTripById)
router.put("/:id", authMiddleware, validateUpdateTrip, updateTrip)
router.delete("/:id", authMiddleware, deleteTrip)

module.exports = router
