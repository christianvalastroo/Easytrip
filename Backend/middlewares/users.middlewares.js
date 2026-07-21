const BadRequestException = require("../exceptions/BadRequestException")

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minPasswordLength = 8

const validateRegister = (req, res, next) => {
    const { firstName, email, password } = req.body

    if (!firstName || !email || !password) {
        throw new BadRequestException("First name, email and password are required")
    }

    if (typeof email !== "string" || typeof password !== "string") {
        throw new BadRequestException("Email and password must be valid text")
    }

    if (!emailRegex.test(email)) {
        throw new BadRequestException("Email must be valid")
    }

    if (password.length < minPasswordLength) {
        throw new BadRequestException("Password must be at least 8 characters long")
    }

    next()
}

const validateLogin = (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestException("Email and password are required")
    }

    if (typeof email !== "string" || typeof password !== "string") {
        throw new BadRequestException("Email and password must be valid text")
    }

    if (!emailRegex.test(email)) {
        throw new BadRequestException("Email must be valid")
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

const validateUpdatePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        throw new BadRequestException("Current password and new password are required")
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        throw new BadRequestException("Passwords must be valid text")
    }

    if (newPassword.length < minPasswordLength) {
        throw new BadRequestException("New password must be at least 8 characters long")
    }

    if (currentPassword === newPassword) {
        throw new BadRequestException("New password must be different from current password")
    }

    next()
}

const validateUpdateOnboarding = (req, res, next) => {
    if (typeof req.body.completed !== "boolean") {
        throw new BadRequestException("Onboarding status must be true or false")
    }

    next()
}

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateUser,
    validateUpdatePassword,
    validateUpdateOnboarding
}
