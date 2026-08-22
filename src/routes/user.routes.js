import { Router } from "express";

import {
     loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/send-registration-otp").post(
    sendRegistrationOtp
);

router.route("/verify-registration-otp").post(
    verifyRegistrationOtp
);

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route(
    "/send-password-reset-otp"
).post(
    sendPasswordResetOtp
);

router.route(
    "/verify-password-reset-otp"
).post(
    verifyPasswordResetOtp
);

router.route(
    "/reset-password"
).post(
    resetPassword
);
router.route("/login").post(loginUser);

router.route("/logout").post(
    verifyJWT,
    logoutUser
);

router.route("/refresh-token").post(
    refreshAccessToken
);

router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
);

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
);

router.route("/update-account").patch(
    verifyJWT,
    updateAccountDetails
);

router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/c/:username").get(
    verifyJWT,
    getUserChannelProfile
);

router.route("/history").get(
    verifyJWT,
    getWatchHistory
);

export default router;