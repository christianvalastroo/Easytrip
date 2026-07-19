const express = require("express")
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    updateTripCover,
    deleteTrip
} = require("./trips.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const upload = require("../../middlewares/upload.middleware")
const { validateCreateTrip, validateUpdateTrip, validateTripId } = require("../../middlewares/trips.middlewares")

const router = express.Router()

router.post("/", authMiddleware, validateCreateTrip, createTrip)
router.get("/", authMiddleware, getTrips)
router.get("/:id", authMiddleware, validateTripId, getTripById)
router.put("/:id", authMiddleware, validateTripId, validateUpdateTrip, updateTrip)
router.put("/:id/cover", authMiddleware, validateTripId, upload.single("cover"), updateTripCover)
router.delete("/:id", authMiddleware, validateTripId, deleteTrip)

module.exports = router
