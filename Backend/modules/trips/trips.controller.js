const Trip = require("./trips.schema")

const createTrip = async (req, res, next) => {
    try {
        const trip = await Trip.create({
            ...req.body,
            owner: req.user.id
        })

        res.status(201).json({
            message: "Trip created successfully",
            trip
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTrip
}