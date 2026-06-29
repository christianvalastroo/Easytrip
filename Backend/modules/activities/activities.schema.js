const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            trim: true
        },
        cost: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            enum: ["transport", "hotel", "food", "visit", "other"],
            default: "other"
        },
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Activity", activitySchema)
