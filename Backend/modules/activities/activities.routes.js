const express = require("express")
const { createActivity, getActivitiesByTrip, getActivityById, updateActivity } = require("./activities.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { validateCreateActivity, validateUpdateActivity } = require("../../middlewares/activities.middlewares")

const router = express.Router()

router.post("/", authMiddleware, validateCreateActivity, createActivity)
router.get("/trip/:tripId", authMiddleware, getActivitiesByTrip)
router.get("/:id", authMiddleware, getActivityById)
router.put("/:id", authMiddleware, validateUpdateActivity, updateActivity)

module.exports = router
