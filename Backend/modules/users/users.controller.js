const bcrypt = require("bcrypt")
const User = require("./users.schema")
const ConflictException = require("../../exceptions/ConflictException")

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new ConflictException("Email already registered")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser
}
