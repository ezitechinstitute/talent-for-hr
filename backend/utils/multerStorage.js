const multer = require("multer");
const fs = require("fs");
const path = require("path");

const getMulterStorage = (folderName) => {
    const uploadDir = path.join(process.cwd(), "uploads", folderName);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, unique + "-" + file.originalname);
        },
    });

    return multer({ storage });
};

module.exports = getMulterStorage;