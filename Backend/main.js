require("dotenv").config()

const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("EasyTrip API online")
})

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "EasyTrip API is running" })
})

const startServer = async () => {
    try {
        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server attivo sulla porta ${PORT}`)
        })
    } catch (error) {
        console.error("Impossibile avviare il server:", error.message)
        process.exit(1)
    }
}

startServer()