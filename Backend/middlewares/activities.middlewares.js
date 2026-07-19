const mongoose = require("mongoose")
const BadRequestException = require("../exceptions/BadRequestException")

const allowedActivityFields = ["title", "description", "date", "time", "location", "cost", "type"]

const isValidDate = (date) => {
    return !Number.isNaN(new Date(date).getTime())
}

const validateActivityDate = (date) => {
    if (date !== undefined && !isValidDate(date)) {
        throw new BadRequestException("Activity date must be a valid date")
    }
}

const validateActivityTime = (time) => {
    if (time !== undefined && time !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new BadRequestException("Activity time must use the HH:mm format")
    }
}

const validateCost = (cost) => {
    if (cost !== undefined && cost < 0) {
        throw new BadRequestException("Cost cannot be negative")
    }
}

const validateCreateActivity = (req, res, next) => {
    const { title, date, trip } = req.body

    if (!title || !date || !trip) {
        throw new BadRequestException("Title, date and trip are required")
    }

    if (!mongoose.Types.ObjectId.isValid(trip)) {
        throw new BadRequestException("Invalid trip id")
    }

    validateActivityDate(date)
    validateActivityTime(req.body.time)
    validateCost(req.body.cost)

    next()
}

const validateUpdateActivity = (req, res, next) => {
    const fields = Object.keys(req.body)

    if (fields.length === 0) {
        throw new BadRequestException("At least one field is required")
    }

    const hasInvalidField = fields.some((field) => !allowedActivityFields.includes(field))

    if (hasInvalidField) {
        throw new BadRequestException("Only title, description, date, time, location, cost and type can be updated")
    }

    validateActivityDate(req.body.date)
    validateActivityTime(req.body.time)
    validateCost(req.body.cost)

    next()
}

const validateActivityId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestException("Invalid activity id")
    }

    next()
}

const validateActivityTripId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.tripId)) {
        throw new BadRequestException("Invalid trip id")
    }

    next()
}

module.exports = {
    validateCreateActivity,
    validateUpdateActivity,
    validateActivityId,
    validateActivityTripId
}
