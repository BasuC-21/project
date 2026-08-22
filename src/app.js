import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

import {
    generateQuizForVideo
} from "./controllers/video.controller.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "16kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
);

app.use(
    express.static("public")
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| USER ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/users",
    userRouter
);

/*
|--------------------------------------------------------------------------
| DIRECT KNOWLEDGE CHECK ROUTE
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
| TEST ROUTE
|--------------------------------------------------------------------------
*/

app.get(
    "/__edutube_test",
    (req, res) => {
        console.log(
            "EDUTUBE TEST ROUTE HIT"
        );

        return res.status(200).json({
            success: true,
            message:
                "EduTube backend test route is working",
            port:
                process.env.PORT || 8000
        });
    }
);

/*
|--------------------------------------------------------------------------
| VIDEO ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/videos",
    videoRouter
);

/*
|--------------------------------------------------------------------------
| COMMENT ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/comments",
    commentRouter
);

/*
|--------------------------------------------------------------------------
| LIKE ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/likes",
    likeRouter
);

/*
|--------------------------------------------------------------------------
| PLAYLIST ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/playlists",
    playlistRouter
);

/*
|--------------------------------------------------------------------------
| SUBSCRIPTION ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/subscriptions",
    subscriptionRouter
);

/*
|--------------------------------------------------------------------------
| TWEET ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/tweets",
    tweetRouter
);

/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/dashboard",
    dashboardRouter
);

/*
|--------------------------------------------------------------------------
| HEALTHCHECK ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/healthcheck",
    healthcheckRouter
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
| This MUST remain LAST.
|--------------------------------------------------------------------------
*/

app.use(
    (req, res) => {
        console.log(
            `404 ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`
        );

        return res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
| This MUST remain AFTER all routes and the 404 handler.
|--------------------------------------------------------------------------
*/

app.use(
    (err, req, res, next) => {
        console.error(
            "========================================"
        );

        console.error(
            "EDUTUBE BACKEND ERROR:"
        );

        console.error(err);

        console.error(
            "========================================"
        );

        const statusCode =
            err?.statusCode ||
            err?.status ||
            500;

        const message =
            err?.message ||
            "Something went wrong on the server";

        return res.status(statusCode).json({
            success: false,
            statusCode,
            message
        });
    }
);

export {
    app
};