import multer from "multer";
import fs from "fs";
import path from "path";

const  getMulterStorage = (folderName)=> {
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
        }
    });

    return multer({ storage });
}


export default getMulterStorage