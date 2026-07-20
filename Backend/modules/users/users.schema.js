const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        passwordResetToken: {
            type: String,
            select: false
        },
        passwordResetExpires: {
            type: Date,
            select: false
        },
        avatar: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            }
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userSchema)
