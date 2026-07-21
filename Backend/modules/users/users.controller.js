const User = require("./users.schema")
const bcrypt = require("bcrypt")
const Trip = require("../trips/trips.schema")
const Activity = require("../activities/activities.schema")
const NotFoundException = require("../../exceptions/NotFoundException")
const BadRequestException = require("../../exceptions/BadRequestException")
const cloudinary = require("../../config/cloudinary")

const uploadAvatar = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "easytrip/avatars",
                resource_type: "image",
                transformation: [
                    {
                        width: 500,
                        height: 500,
                        crop: "fill",
                        gravity: "auto"
                    }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error)
                    return
                }

                resolve(result)
            }
        )

        uploadStream.end(buffer)
    })
}

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

const updateCurrentUserOnboarding = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { onboardingCompleted: req.body.completed },
            { new: true, runValidators: true }
        ).select("-password")

        if (!user) {
            throw new NotFoundException("User not found")
        }

        res.status(200).json({
            message: "Onboarding status updated successfully",
            user
        })
    } catch (error) {
        next(error)
    }
}

const updateCurrentUserAvatar = async (req, res, next) => {
    let uploadedAvatar
    let isAvatarSaved = false

    try {
        if (!req.file) {
            throw new BadRequestException("Avatar image is required")
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            throw new NotFoundException("User not found")
        }

        uploadedAvatar = await uploadAvatar(req.file.buffer)
        const previousPublicId = user.avatar?.publicId

        user.avatar = {
            url: uploadedAvatar.secure_url,
            publicId: uploadedAvatar.public_id
        }

        await user.save()
        isAvatarSaved = true

        if (previousPublicId) {
            await cloudinary.uploader.destroy(previousPublicId).catch((error) => {
                console.error("Unable to delete previous avatar:", error.message)
            })
        }

        const updatedUser = await User.findById(user._id).select("-password")

        res.status(200).json({
            message: "Avatar updated successfully",
            user: updatedUser
        })
    } catch (error) {
        if (uploadedAvatar?.public_id && !isAvatarSaved) {
            await cloudinary.uploader.destroy(uploadedAvatar.public_id).catch(() => {})
        }

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

        if (user.avatar?.publicId) {
            await cloudinary.uploader.destroy(user.avatar.publicId).catch((error) => {
                console.error("Unable to delete account avatar:", error.message)
            })
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
    updateCurrentUserPassword,
    updateCurrentUserOnboarding,
    updateCurrentUserAvatar,
    deleteCurrentUser
}
