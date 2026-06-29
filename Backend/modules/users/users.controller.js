const User = require("./users.schema")
const NotFoundException = require("../../exceptions/NotFoundException")

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

const deleteCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id)

        if (!user) {
            throw new NotFoundException("User not found")
        }

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
    deleteCurrentUser
}
