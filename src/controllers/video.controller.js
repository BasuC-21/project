import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateQuiz } from "../services/quiz.service.js";
import { transcribeVideo } from "../services/transcription.service.js";


const removeTempFile = (filePath) => {
    if (
        filePath &&
        fs.existsSync(filePath)
    ) {
        fs.unlinkSync(filePath);
    }
};

const publishAVideo = asyncHandler(
    async (req, res) => {
        const {
            title,
            description
        } = req.body;

        if (
            !title?.trim() ||
            !description?.trim()
        ) {
            throw new ApiError(
                400,
                "Title and description are required"
            );
        }

        const videoFileLocalPath =
            req.files?.videoFile?.[0]
                ?.path;

        const thumbnailLocalPath =
            req.files?.thumbnail?.[0]
                ?.path;

        if (!videoFileLocalPath) {
            throw new ApiError(
                400,
                "Video file is required"
            );
        }

        if (!thumbnailLocalPath) {
            throw new ApiError(
                400,
                "Thumbnail is required"
            );
        }

        try {
            const videoFile =
                await uploadOnCloudinary(
                    videoFileLocalPath
                );

            const thumbnail =
                await uploadOnCloudinary(
                    thumbnailLocalPath
                );

            if (!videoFile?.url) {
                throw new ApiError(
                    400,
                    "Video upload failed"
                );
            }

            if (!thumbnail?.url) {
                throw new ApiError(
                    400,
                    "Thumbnail upload failed"
                );
            }

            const video =
                await Video.create({
                    videoFile:
                        videoFile.url,
                    thumbnail:
                        thumbnail.url,
                    title:
                        title.trim(),
                    description:
                        description.trim(),
                    duration:
                        videoFile.duration ||
                        0,
                    owner:
                        req.user?._id,
                    isPublished:
                        true,
                    quiz: []
                });

            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        video,
                        "Video published successfully"
                    )
                );
        } finally {
            removeTempFile(
                videoFileLocalPath
            );

            removeTempFile(
                thumbnailLocalPath
            );
        }
    }
);

const getVideoById = asyncHandler(
    async (req, res) => {
        const {
            videoId
        } = req.params;

        const video =
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $inc: {
                        views: 1
                    }
                },
                {
                    new: true
                }
            ).populate(
                "owner",
                "username fullName avatar"
            );

        if (!video) {
            throw new ApiError(
                404,
                "Video not found"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video fetched successfully"
                )
            );
    }
);

const generateQuizForVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    
let transcript = video.transcript;

if (!transcript?.trim()) {
    console.log("No saved transcript. Starting video transcription...");

    transcript = await transcribeVideo(
        video.videoFile
    );

    if (!transcript?.trim()) {
        throw new ApiError(
            500,
            "Video transcription failed"
        );
    }

    video.transcript = transcript;
    video.quizGeneratedFromTranscript = false;

    await video.save();

    console.log("Transcript saved to database.");
} else {
    console.log("Using existing transcript. Skipping Whisper.");
}

    console.log(
        "Transcript generated:",
        transcript.substring(0, 300)
    );

    console.log(
        "Generating quiz from transcript..."
    );

    const quiz = await generateQuiz(
        video.title,
        video.description,
        transcript
    );

    if (
        !Array.isArray(quiz) ||
        quiz.length !== 5
    ) {
        throw new ApiError(
            500,
            "Quiz generation failed"
        );
    }

    for (const question of quiz) {
        if (
            !question.question ||
            !Array.isArray(question.options) ||
            question.options.length !== 4 ||
            !question.correctAnswer ||
            !question.options.includes(
                question.correctAnswer
            )
        ) {
            throw new ApiError(
                500,
                "Generated quiz contains invalid data"
            );
        }
    }

    await Video.findByIdAndUpdate(
    videoId,
    {
        $set: {
            quiz: quiz
        }
    },
    {
        returnDocument: "after"
    }
);

console.log(
    "Quiz generated from transcript and saved."
);

    return res.status(200).json(
        new ApiResponse(
            200,
            video.quiz,
            "Knowledge Check generated from video transcript successfully"
        )
    );
});
const updateVideo = asyncHandler(
    async (req, res) => {
        const {
            videoId
        } = req.params;

        const {
            title,
            description
        } = req.body;

        const video =
            await Video.findOne({
                _id: videoId,
                owner:
                    req.user?._id
            });

        if (!video) {
            throw new ApiError(
                404,
                "Video not found or unauthorized"
            );
        }

        if (title?.trim()) {
            video.title =
                title.trim();
        }

        if (description?.trim()) {
            video.description =
                description.trim();
        }

        if (req.file?.path) {
            try {
                const thumbnail =
                    await uploadOnCloudinary(
                        req.file.path
                    );

                if (!thumbnail?.url) {
                    throw new ApiError(
                        400,
                        "Thumbnail upload failed"
                    );
                }

                video.thumbnail =
                    thumbnail.url;
            } finally {
                removeTempFile(
                    req.file.path
                );
            }
        }

        await video.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video updated successfully"
                )
            );
    }
);

const deleteVideo = asyncHandler(
    async (req, res) => {
        const {
            videoId
        } = req.params;

        const video =
            await Video.findOneAndDelete({
                _id: videoId,
                owner:
                    req.user?._id
            });

        if (!video) {
            throw new ApiError(
                404,
                "Video not found or unauthorized"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Video deleted successfully"
                )
            );
    }
);

const togglePublishStatus =
    asyncHandler(
        async (req, res) => {
            const {
                videoId
            } = req.params;

            const video =
                await Video.findOne({
                    _id: videoId,
                    owner:
                        req.user?._id
                });

            if (!video) {
                throw new ApiError(
                    404,
                    "Video not found or unauthorized"
                );
            }

            video.isPublished =
                !video.isPublished;

            await video.save();

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        video,
                        `Video ${
                            video.isPublished
                                ? "published"
                                : "unpublished"
                        } successfully`
                    )
                );
        }
    );

const getAllVideos =
    asyncHandler(
        async (req, res) => {
            const videos =
                await Video.find({
                    isPublished: true
                })
                    .populate(
                        "owner",
                        "username fullName avatar"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        videos,
                        "Videos fetched successfully"
                    )
                );
        }
    );

export {
    publishAVideo,
    getVideoById,
    generateQuizForVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
};