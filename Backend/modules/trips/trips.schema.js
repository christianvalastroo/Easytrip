const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        destination: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        budget: {
            type: Number,
            default: 0,
            min: 0
        },
        notes: {
            type: String,
            trim: true
        },
        checklist: {
            type: [
                {
                    text: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    isCompleted: {
                        type: Boolean,
                        default: false
                    }
                }
            ],
            default: []
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

module.exports = mongoose.model("Trip", tripSchema)
