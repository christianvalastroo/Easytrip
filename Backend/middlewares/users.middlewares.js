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

module.exports = {
    validateRegister,
    validateLogin
}
