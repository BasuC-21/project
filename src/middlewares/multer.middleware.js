import multer from "multer";
import fs from "fs";
import path from "path";

const tempDirectory = path.resolve("public", "temp");

if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDirectory);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            "-" +
            file.originalname;

        cb(null, uniqueName);
    }
});

export const upload = multer({
    storage
});