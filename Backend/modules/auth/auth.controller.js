const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../users/users.schema")
const BadRequestException = require("../../exceptions/BadRequestException")
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

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            throw new BadRequestException("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password")
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser,
    loginUser
}
