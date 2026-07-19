const Activity = require("./activities.schema")
const Trip = require("../trips/trips.schema")
const NotFoundException = require("../../exceptions/NotFoundException")
const BadRequestException = require("../../exceptions/BadRequestException")

const validateActivityWithinTripDates = (activityDate, trip) => {
    const date = new Date(activityDate)

    if (date < new Date(trip.startDate) || date > new Date(trip.endDate)) {
        throw new BadRequestException("Activity date must be within trip dates")
    }
}

const createActivity = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            _id: req.body.trip,
            owner: req.user.id
        })

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

        validateActivityWithinTripDates(req.body.date, trip)

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
        }).sort({ date: 1, time: 1 })

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
        const activity = await Activity.findOne({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!activity) {
            throw new NotFoundException("Activity not found")
        }

        if (req.body.date) {
            const trip = await Trip.findOne({
                _id: activity.trip,
                owner: req.user.id
            })

            if (!trip) {
                throw new NotFoundException("Trip not found")
            }

            validateActivityWithinTripDates(req.body.date, trip)
        }

        Object.assign(activity, req.body)
        await activity.save()

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
