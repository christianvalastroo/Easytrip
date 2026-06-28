const Trip = require("./trips.schema")
const NotFoundException = require("../../exceptions/NotFoundException")

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
        const trip = await Trip.findOneAndUpdate(
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

        if (!trip) {
            throw new NotFoundException("Trip not found")
        }

        res.status(200).json({
            message: "Trip updated successfully",
            trip
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTrip,
    getTrips,
    getTripById,
    updateTrip
}
