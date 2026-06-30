const Trip = require("./trips.schema")
const Activity = require("../activities/activities.schema")
const NotFoundException = require("../../exceptions/NotFoundException")
const BadRequestException = require("../../exceptions/BadRequestException")

const validateTripDateRange = (startDate, endDate) => {
    if (new Date(endDate) < new Date(startDate)) {
        throw new BadRequestException("End date cannot be before start date")
    }
}

const createTrip = async (req, res, next) => {
    try {
        const trip = await Trip.create({
            ...req.body,
            owner: req.user.id
        })

        res.status(201).json({
            message: "Trip created successfully",
            trip
        })
    } catch (error) {
        next(error)
    }
}

const getTrips = async (req, res, next) => {
    try {
        const trips = await Trip.find({ owner: req.user.id }).sort({ startDate: 1 })

        res.status(200).json(trips)
    } catch (error) {
        next(error)
    }
}

const getTripById = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

        res.status(200).json(trip)
    } catch (error) {
        next(error)
    }
}

const updateTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

        const nextStartDate = req.body.startDate || trip.startDate
        const nextEndDate = req.body.endDate || trip.endDate

        validateTripDateRange(nextStartDate, nextEndDate)

        const activitiesOutsideDateRange = await Activity.countDocuments({
            trip: trip._id,
            owner: req.user.id,
            $or: [
                { date: { $lt: nextStartDate } },
                { date: { $gt: nextEndDate } }
            ]
        })

        if (activitiesOutsideDateRange > 0) {
            throw new BadRequestException("Trip dates cannot exclude existing activities")
        }

        Object.assign(trip, req.body)
        await trip.save()

        res.status(200).json({
            message: "Trip updated successfully",
            trip
        })
    } catch (error) {
        next(error)
    }
}

const deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        })

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

        await Activity.deleteMany({
            trip: req.params.id,
            owner: req.user.id
        })

        res.status(200).json({
            message: "Trip deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip
}
