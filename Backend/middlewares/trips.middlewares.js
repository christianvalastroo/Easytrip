const mongoose = require("mongoose")
const BadRequestException = require("../exceptions/BadRequestException")

const allowedTripFields = ["title", "destination", "startDate", "endDate", "budget", "notes", "checklist"]

const isValidDate = (date) => {
    return !Number.isNaN(new Date(date).getTime())
}

const validateTripDates = (startDate, endDate) => {
    if (startDate !== undefined && !isValidDate(startDate)) {
        throw new BadRequestException("Start date must be a valid date")
    }

    if (endDate !== undefined && !isValidDate(endDate)) {
        throw new BadRequestException("End date must be a valid date")
    }

    if (startDate !== undefined && endDate !== undefined && new Date(endDate) < new Date(startDate)) {
        throw new BadRequestException("End date cannot be before start date")
    }
}

const validateBudget = (budget) => {
    if (budget !== undefined && budget < 0) {
        throw new BadRequestException("Budget cannot be negative")
    }
}

const validateChecklist = (checklist) => {
    if (checklist === undefined) {
        return
    }

    if (!Array.isArray(checklist)) {
        throw new BadRequestException("Checklist must be a list")
    }

    const hasInvalidItem = checklist.some((item) => {
        return (
            !item ||
            typeof item.text !== "string" ||
            item.text.trim().length === 0 ||
            (item.isCompleted !== undefined && typeof item.isCompleted !== "boolean")
        )
    })

    if (hasInvalidItem) {
        throw new BadRequestException("Checklist items need text and completion status")
    }
}

const validateCreateTrip = (req, res, next) => {
    const { title, destination, startDate, endDate } = req.body

    if (!title || !destination || !startDate || !endDate) {
        throw new BadRequestException("Title, destination, start date and end date are required")
    }

    validateTripDates(startDate, endDate)
    validateBudget(req.body.budget)
    validateChecklist(req.body.checklist)

    next()
}

const validateUpdateTrip = (req, res, next) => {
    const fields = Object.keys(req.body)

    if (fields.length === 0) {
        throw new BadRequestException("At least one field is required")
    }

    const hasInvalidField = fields.some((field) => !allowedTripFields.includes(field))

    if (hasInvalidField) {
        throw new BadRequestException("Only title, destination, start date, end date, budget, notes and checklist can be updated")
    }

    validateTripDates(req.body.startDate, req.body.endDate)
    validateBudget(req.body.budget)
    validateChecklist(req.body.checklist)

    next()
}

const validateTripId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestException("Invalid trip id")
    }

    next()
}

module.exports = {
    validateCreateTrip,
    validateUpdateTrip,
    validateTripId
}
