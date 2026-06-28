const BadRequestException = require("../exceptions/BadRequestException")

const allowedTripFields = ["title", "destination", "startDate", "endDate", "budget", "notes"]

const validateCreateTrip = (req, res, next) => {
    const { title, destination, startDate, endDate } = req.body

    if (!title || !destination || !startDate || !endDate) {
        throw new BadRequestException("Title, destination, start date and end date are required")
    }

    next()
}

const validateUpdateTrip = (req, res, next) => {
    const fields = Object.keys(req.body)

    if (fields.length === 0) {
        throw new BadRequestException("At least one field is required")
    }

    const hasInvalidField = fields.some((field) => !allowedTripFields.includes(field))

    if (hasInvalidField) {
        throw new BadRequestException("Only title, destination, start date, end date, budget and notes can be updated")
    }

    next()
}

module.exports = {
    validateCreateTrip,
    validateUpdateTrip
}
