import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createPlaylist);

router.get("/", verifyJWT, getUserPlaylists);

router.get("/:playlistId", verifyJWT, getPlaylistById);

router.patch("/:playlistId", verifyJWT, updatePlaylist);

router.delete("/:playlistId", verifyJWT, deletePlaylist);

router.post(
    "/:playlistId/videos/:videoId",
    verifyJWT,
    addVideoToPlaylist
);

router.delete(
    "/:playlistId/videos/:videoId",
    verifyJWT,
    removeVideoFromPlaylist
);

export default router;