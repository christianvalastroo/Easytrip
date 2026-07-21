const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const User = require("../users/users.schema")
const BadRequestException = require("../../exceptions/BadRequestException")
const ConflictException = require("../../exceptions/ConflictException")
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../../services/email.service")

const createSessionToken = (userId) => jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
)

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

        const token = createSessionToken(user._id)

        await sendWelcomeEmail({
            email: user.email,
            firstName: user.firstName,
            language: req.body.language
        }).catch((error) => {
            console.error("Unable to send welcome email:", error.message)
        })

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

        const token = createSessionToken(user._id)

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

const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex")

            user.passwordResetToken = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex")
            user.passwordResetExpires = Date.now() + 30 * 60 * 1000
            await user.save()

            try {
                await sendPasswordResetEmail({
                    email: user.email,
                    firstName: user.firstName,
                    resetToken,
                    language: req.body.language
                })
            } catch (error) {
                user.passwordResetToken = undefined
                user.passwordResetExpires = undefined
                await user.save()
                console.error("Unable to send password reset email:", error.message)
            }
        }

        res.status(200).json({
            message: "If an account exists for this email, a password reset link has been sent"
        })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.body.token)
            .digest("hex")

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select("+passwordResetToken +passwordResetExpires")

        if (!user) {
            throw new BadRequestException("Password reset link is invalid or has expired")
        }

        user.password = await bcrypt.hash(req.body.password, 10)
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()

        res.status(200).json({
            message: "Password reset successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
}
