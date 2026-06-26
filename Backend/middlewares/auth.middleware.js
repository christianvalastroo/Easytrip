const jwt = require("jsonwebtoken")
const UnauthorizedException = require("../exceptions/UnauthorizedException")

const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authorization token is required")
        }

        const token = authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            next(new UnauthorizedException("Invalid or expired token"))
            return
        }

        next(error)
    }
}

module.exports = authMiddleware
