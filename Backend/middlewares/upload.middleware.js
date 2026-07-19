const multer = require("multer")
const BadRequestException = require("../exceptions/BadRequestException")

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return callback(
                new BadRequestException("Only JPEG, PNG and WebP images are allowed")
            )
        }

        callback(null, true)
    },
})

module.exports = upload
