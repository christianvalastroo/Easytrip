const express = require("express")
const { createActivity, getActivitiesByTrip } = require("./activities.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

const router = express.Router()

router.post("/", authMiddleware, createActivity)
router.get("/trip/:tripId", authMiddleware, getActivitiesByTrip)

module.exports = router
