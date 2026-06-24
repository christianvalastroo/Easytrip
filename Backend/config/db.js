const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("MongoDB collegato")
}

module.exports = connectDB