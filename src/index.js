import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import connectDB from "./db/index.js";
import { app } from "./app.js";

import {
    generateQuizForVideo
} from "./controllers/video.controller.js";


const PORT = process.env.PORT || 8000;


/*
|--------------------------------------------------------------------------
| DIRECT KNOWLEDGE CHECK ROUTE
|--------------------------------------------------------------------------
| This is intentionally registered here, directly on the same Express
| app that is started below.
|
| It bypasses:
|   video.routes.js
|   app.use("/api/v1/videos", videoRouter)
|
| This lets us prove whether the running Express app can register
| this endpoint at all.
|--------------------------------------------------------------------------
*/

app.post(
    "/api/v1/videos/:videoId/generate-quiz",
    (req, res, next) => {
        console.log(
            "========================================"
        );

        console.log(
            "DIRECT KNOWLEDGE CHECK ROUTE HIT"
        );

        console.log(
            "Method:",
            req.method
        );

        console.log(
            "URL:",
            req.originalUrl
        );

        console.log(
            "Video ID:",
            req.params.videoId
        );

        console.log(
            "========================================"
        );

        return generateQuizForVideo(
            req,
            res,
            next
        );
    }
);


/*
|--------------------------------------------------------------------------
| SIMPLE SERVER TEST ROUTE
|--------------------------------------------------------------------------
| This proves that THIS exact index.js is running.
|--------------------------------------------------------------------------
*/

app.get(
    "/__edutube_test",
    (req, res) => {
        console.log(
            "EduTube test route reached."
        );

        return res.status(200).json({
            success: true,
            message:
                "EduTube backend is running from src/index.js",
            port: PORT
        });
    }
);


/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

connectDB()
    .then(() => {
        app.listen(
    PORT,
    "0.0.0.0",
    () => {
                console.log(
                    "========================================"
                );

                console.log(
                    "EduTube backend started"
                );

                console.log(
                    `Server is running at PORT:${PORT}`
                );

                console.log(
                    "Direct Knowledge Check route:"
                );

                console.log(
                    `POST http://localhost:${PORT}/api/v1/videos/:videoId/generate-quiz`
                );

                console.log(
                    "Test route:"
                );

                console.log(
                    `GET http://localhost:${PORT}/__edutube_test`
                );

                console.log(
                    "========================================"
                );
            }
        );
    })
    .catch((err) => {
        console.error(
            "MongoDB connection failed !!!"
        );

        console.error(err);

        process.exit(1);
    });