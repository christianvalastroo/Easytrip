const BadRequestException = require("../exceptions/BadRequestException")

const allowedActivityFields = ["title", "description", "date", "location", "cost", "type"]

const validateCreateActivity = (req, res, next) => {
    const { title, date, trip } = req.body

    if (!title || !date || !trip) {
        throw new BadRequestException("Title, date and trip are required")
    }
    next()
}

const validateUpdateActivity = (req, res, next) => {
    const fields = Object.keys(req.body)

    if (fields.length === 0) {
        throw new BadRequestException("At least one field is required")
    }

    const hasInvalidField = fields.some((field) => !allowedActivityFields.includes(field))

    if (hasInvalidField) {
        throw new BadRequestException("Only title, description, date, location, cost and type can be updated")
    }

    next()
}

module.exports = {
    validateCreateActivity,
    validateUpdateActivity
}