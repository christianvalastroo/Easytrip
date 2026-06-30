const errorHandler = (err, req, res, next) => {
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: err.message
        })
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid id"
        })
    }

    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        message: err.message || "Internal server error"
    })
}

module.exports = errorHandler
