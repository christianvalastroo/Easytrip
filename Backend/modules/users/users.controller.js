const User = require("./users.schema")
const bcrypt = require("bcrypt")
const Trip = require("../trips/trips.schema")
const Activity = require("../activities/activities.schema")
const NotFoundException = require("../../exceptions/NotFoundException")
const BadRequestException = require("../../exceptions/BadRequestException")

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password")

        if (!user) {
            throw new NotFoundException("User not found")
        }

        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

const updateCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true }
        ).select("-password")

        if (!user) {
            throw new NotFoundException("User not found")
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user
        })
    } catch (error) {
        next(error)
    }
}

const updateCurrentUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body
        const user = await User.findById(req.user.id)

        if (!user) {
            throw new NotFoundException("User not found")
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isCurrentPasswordValid) {
            throw new BadRequestException("Current password is incorrect")
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        res.status(200).json({
            message: "Password updated successfully"
        })
    } catch (error) {
        next(error)
    }
}

const deleteCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            throw new NotFoundException("User not found")
        }

        await Activity.deleteMany({ owner: req.user.id })
        await Trip.deleteMany({ owner: req.user.id })
        await User.findByIdAndDelete(req.user.id)

        res.status(200).json({
            message: "Account deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getCurrentUser,
    updateCurrentUser,
    updateCurrentUserPassword,
    deleteCurrentUser
}
