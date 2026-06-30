const express = require("express")
const { createActivity, getActivitiesByTrip, getActivityById } = require("./activities.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createActivity)
router.get("/trip/:tripId", authMiddleware, getActivitiesByTrip)
router.get("/:id", authMiddleware, getActivityById)

module.exports = router
