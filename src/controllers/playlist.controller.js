import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const newPlaylist = await playlist.create({
        name,
        description,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newPlaylist,
            "Playlist created successfully"
        )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await playlist.find({
        owner: req.user._id
    }).populate("videos");

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlistData = await playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username fullName avatar");

    if (!playlistData) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlistData,
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlistData = await playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    });

    if (!playlistData) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }

    if (!playlistData.videos.includes(videoId)) {
        playlistData.videos.push(videoId);
        await playlistData.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlistData,
            "Video added to playlist"
        )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlistData = await playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    });

    if (!playlistData) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }

    playlistData.videos = playlistData.videos.filter(
        (id) => id.toString() !== videoId
    );

    await playlistData.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlistData,
            "Video removed from playlist"
        )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const playlistData = await playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    });

    if (!playlistData) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }

    if (name) playlistData.name = name;
    if (description) playlistData.description = description;

    await playlistData.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlistData,
            "Playlist updated successfully"
        )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const deletedPlaylist = await playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    });

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
};