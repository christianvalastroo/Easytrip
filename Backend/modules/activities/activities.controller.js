const Activity = require("./activities.schema")
const Trip = require("../trips/trips.schema")
const NotFoundException = require("../../exceptions/NotFoundException")

const createActivity = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            _id: req.body.trip,
            owner: req.user.id
        })

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

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

const getActivityById = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!activity) {
            throw new NotFoundException("Activity not found")
        }

        res.status(200).json(activity)
    } catch (error) {
        next(error)
    }
}

const updateActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user.id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!activity) {
            throw new NotFoundException("Activity not found")
        }

        res.status(200).json({
            message: "Activity updated successfully",
            activity
        })
    } catch (error) {
        next(error)
    }
}

const deleteActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!activity) {
            throw new NotFoundException("Activity not found")
        }

        res.status(200).json({
            message: "Activity deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createActivity,
    getActivitiesByTrip,
    getActivityById,
    updateActivity,
    deleteActivity
}
