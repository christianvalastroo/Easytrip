const express = require("express")
const { createActivity, getActivitiesByTrip, getActivityById, updateActivity, deleteActivity } = require("./activities.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateCreateActivity, validateUpdateActivity, validateActivityId, validateActivityTripId } = require("../../middlewares/activities.middlewares")

const router = express.Router()

router.post("/", authMiddleware, validateCreateActivity, createActivity)
router.get("/trip/:tripId", authMiddleware, validateActivityTripId, getActivitiesByTrip)
router.get("/:id", authMiddleware, validateActivityId, getActivityById)
router.put("/:id", authMiddleware, validateActivityId, validateUpdateActivity, updateActivity)
router.delete("/:id", authMiddleware, validateActivityId, deleteActivity)

module.exports = router
