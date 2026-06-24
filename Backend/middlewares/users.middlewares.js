const BadRequestException = require("../exceptions/BadRequestException")

const validateRegister = (req, res, next) => {
    const { firstName, email, password } = req.body

    if (!firstName || !email || !password) {
        throw new BadRequestException("Nome, email e password sono obbligatori")
    }

    next()
}

module.exports = {
    validateRegister
}