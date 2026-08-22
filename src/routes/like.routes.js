import { Router } from "express";

import {
    toggleVideoLike,
    getVideoLikeStatus,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
    "/video/:videoId/status",
    verifyJWT,
    getVideoLikeStatus
);

router.post(
    "/video/:videoId",
    verifyJWT,
    toggleVideoLike
);

router.post(
    "/comment/:commentId",
    verifyJWT,
    toggleCommentLike
);

router.post(
    "/tweet/:tweetId",
    verifyJWT,
    toggleTweetLike
);

router.get(
    "/videos",
    verifyJWT,
    getLikedVideos
);

export default router;