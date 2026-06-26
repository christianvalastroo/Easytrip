const BadRequestException = require("../exceptions/BadRequestException")

const validateRegister = (req, res, next) => {
    const { firstName, email, password } = req.body

    if (!firstName || !email || !password) {
        throw new BadRequestException("First name, email and password are required")
    }

    next()
}

const validateLogin = (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestException("Email and password are required")
    }

    next()
}

const validateUpdateUser = (req, res, next) => {
    const allowedFields = ["firstName", "lastName"]
    const fields = Object.keys(req.body)

    if (fields.length === 0) {
        throw new BadRequestException("At least one field is required")
    }

    const hasInvalidField = fields.some((field) => !allowedFields.includes(field))

    if (hasInvalidField) {
        throw new BadRequestException("Only first name and last name can be updated")
    }

    next()
}

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateUser
}
