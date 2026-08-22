import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAllTweets);

router.post("/", verifyJWT, createTweet);

router.get("/user/:userId", getUserTweets);

router.patch("/:tweetId", verifyJWT, updateTweet);

router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;