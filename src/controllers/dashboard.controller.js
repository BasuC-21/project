import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.find({
        owner: userId
    });

    const videoIds = videos.map((video) => video._id);

    const totalViews = videos.reduce(
        (total, video) => total + (video.views || 0),
        0
    );

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    const totalComments = await Comment.countDocuments({
        video: { $in: videoIds }
    });

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos: videos.length,
                totalViews,
                totalLikes,
                totalComments,
                totalSubscribers
            },
            "Channel statistics fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats,
    getChannelVideos
};