const Activity = require("./activities.schema")

const createActivity = async (req, res, next) => {
    try {
        const activity = await Activity.create({
            ...req.body,
            owner: req.user.id
        })

        res.status(201).json({
            message: "Activity created successfully",
            activity
        })
    } catch (error) {
        next(error)
    }
}

const getActivitiesByTrip = async (req, res, next) => {
    try {
        const activities = await Activity.find({
            trip: req.params.tripId,
            owner: req.user.id
        }).sort({ date: 1 })

        res.status(200).json(activities)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createActivity,
    getActivitiesByTrip
}
