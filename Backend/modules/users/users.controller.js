const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("./users.schema")
const BadRequestException = require("../../exceptions/BadRequestException")
const ConflictException = require("../../exceptions/ConflictException")
const NotFoundException = require("../../exceptions/NotFoundException")

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

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid user id")
        }

        const user = await User.findById(id).select("-password")

        if (!user) {
            throw new NotFoundException("User not found")
        }

        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser,
    getUserById
}
