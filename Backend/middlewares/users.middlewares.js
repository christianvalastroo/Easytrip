const BadRequestException = require("../exceptions/BadRequestException")

const validateRegister = (req, res, next) => {
    const { firstName, email, password } = req.body

    if (!firstName || !email || !password) {
        throw new BadRequestException("First name, email and password are required")
    }

    next()
}

module.exports = {
    validateRegister
}
