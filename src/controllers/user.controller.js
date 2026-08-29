import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { RegistrationOtp } from "../models/registrationOtp.model.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import { PasswordResetOtp } from "../models/passwordResetOtp.model.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        });

        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};


/*
|--------------------------------------------------------------------------
| SEND REGISTRATION OTP
|--------------------------------------------------------------------------
*/

const sendRegistrationOtp = asyncHandler(
    async (req, res) => {

        const { email } = req.body;

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Email is required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        console.log(
            "Checking registration email:",
            normalizedEmail
        );


        /*
        |--------------------------------------------------------------------------
        | CHECK IF EMAIL ALREADY EXISTS
        |--------------------------------------------------------------------------
        */

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            console.log(
                "REGISTERED EMAIL FOUND:",
                normalizedEmail
            );

            return res.status(409).json({
                success: false,
                statusCode: 409,
                message:
                    "This email is already registered. Please use another email."
            });
        }


        /*
        |--------------------------------------------------------------------------
        | GENERATE OTP
        |--------------------------------------------------------------------------
        */

        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await RegistrationOtp.findOneAndUpdate(
            {
                email: normalizedEmail
            },
            {
                email: normalizedEmail,
                otp,
                expiresAt,
                verified: false
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );


        /*
        |--------------------------------------------------------------------------
        | SEND EMAIL
        |--------------------------------------------------------------------------
        */

        if (process.env.DEMO_MODE === "true") {
    console.log(
        `DEMO MODE - Registration OTP for ${normalizedEmail}: ${otp}`
    );
} else {
    await sendOtpEmail(
        normalizedEmail,
        otp
    );

    console.log(
        "OTP sent successfully to:",
        normalizedEmail
    );
}


        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Verification OTP sent to your email"
            )
        );
    }
);


/*
|--------------------------------------------------------------------------
| VERIFY REGISTRATION OTP
|--------------------------------------------------------------------------
*/

const verifyRegistrationOtp =
    asyncHandler(
        async (req, res) => {

            const {
                email,
                otp
            } = req.body;


            if (
                !email?.trim() ||
                !otp?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message:
                        "Email and OTP are required"
                });
            }


            const normalizedEmail =
                email.trim().toLowerCase();


            const registrationOtp =
                await RegistrationOtp.findOne({
                    email: normalizedEmail
                });


            if (!registrationOtp) {
                throw new ApiError(
                    404,
                    "OTP not found. Please request a new OTP"
                );
            }


            if (
                registrationOtp.expiresAt <
                new Date()
            ) {

                await RegistrationOtp.deleteOne({
                    _id: registrationOtp._id
                });

                throw new ApiError(
                    400,
                    "OTP has expired. Please request a new OTP"
                );
            }


            if (
                registrationOtp.otp !==
                otp.trim()
            ) {
                throw new ApiError(
                    400,
                    "Invalid OTP"
                );
            }


            registrationOtp.verified = true;

            await registrationOtp.save();


            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "Email verified successfully"
                )
            );
        }
    );


/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

const registerUser = asyncHandler(
    async (req, res) => {

        const {
            fullName,
            email,
            username,
            password
        } = req.body;


        const normalizedEmail =
            email?.trim().toLowerCase();


        const normalizedUsername =
            username?.trim().toLowerCase();


        console.log(
            "Registration email:",
            normalizedEmail
        );

        console.log(
            "Registration username:",
            normalizedUsername
        );


        /*
        |--------------------------------------------------------------------------
        | REQUIRED FIELDS
        |--------------------------------------------------------------------------
        */

        if (
            !fullName?.trim() ||
            !normalizedEmail ||
            !normalizedUsername ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                statusCode: 400,
                message:
                    "All fields are required"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | EMAIL FORMAT
        |--------------------------------------------------------------------------
        */

        if (
            !/^\S+@\S+\.\S+$/.test(
                normalizedEmail
            )
        ) {

            return res.status(400).json({
                success: false,
                statusCode: 400,
                message:
                    "Please enter a valid email address"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | EMAIL MUST BE VERIFIED
        |--------------------------------------------------------------------------
        */

        const verifiedOtp =
            await RegistrationOtp.findOne({
                email: normalizedEmail,
                verified: true
            });


        if (!verifiedOtp) {

            return res.status(400).json({
                success: false,
                statusCode: 400,
                message:
                    "Please verify your email with OTP before creating your account."
            });
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DUPLICATE EMAIL / USERNAME
        |--------------------------------------------------------------------------
        */

        const existedUser =
            await User.findOne({
                $or: [
                    {
                        username:
                            normalizedUsername
                    },
                    {
                        email:
                            normalizedEmail
                    }
                ]
            });


        if (existedUser) {

            if (
                existedUser.email ===
                normalizedEmail
            ) {

                return res.status(409).json({
                    success: false,
                    statusCode: 409,
                    message:
                        "This email is already registered. Please use another email."
                });
            }


            return res.status(409).json({
                success: false,
                statusCode: 409,
                message:
                    "This username is already taken. Please choose another username."
            });
        }


        console.log(
            "Uploaded files:",
            req.files
        );


        /*
        |--------------------------------------------------------------------------
        | AVATAR
        |--------------------------------------------------------------------------
        */

        const avatarLocalPath =
            req.files?.avatar?.[0]?.path;


        let coverImageLocalPath;


        if (
            req.files &&
            Array.isArray(
                req.files.coverImage
            ) &&
            req.files.coverImage.length > 0
        ) {

            coverImageLocalPath =
                req.files.coverImage[0].path;
        }


        if (!avatarLocalPath) {

            throw new ApiError(
                400,
                "Avatar file is required"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CLOUDINARY UPLOAD
        |--------------------------------------------------------------------------
        */

        const avatar =
            await uploadOnCloudinary(
                avatarLocalPath
            );


        const coverImage =
            coverImageLocalPath
                ? await uploadOnCloudinary(
                    coverImageLocalPath
                )
                : null;


        if (!avatar) {

            throw new ApiError(
                400,
                "Avatar file is required"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE USER
        |--------------------------------------------------------------------------
        */

        const user =
            await User.create({

                fullName,

                avatar:
                    avatar.url,

                coverImage:
                    coverImage?.url || "",

                email:
                    normalizedEmail,

                password,

                username:
                    normalizedUsername
            });


        const createdUser =
            await User.findById(
                user._id
            ).select(
                "-password -refreshToken"
            );


        if (!createdUser) {

            throw new ApiError(
                500,
                "Something went wrong while registering the user"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DELETE USED OTP
        |--------------------------------------------------------------------------
        */

        await RegistrationOtp.deleteOne({
            _id: verifiedOtp._id
        });


        return res.status(201).json(
            new ApiResponse(
                201,
                createdUser,
                "User registered successfully"
            )
        );
    }
);


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const loginUser =
    asyncHandler(
        async (req, res) => {

            const {
                email,
                username,
                password
            } = req.body;


            /*
            |--------------------------------------------------------------------------
            | VALIDATE LOGIN INPUT
            |--------------------------------------------------------------------------
            */

            const normalizedEmail =
                email?.trim().toLowerCase();

            const normalizedUsername =
                username?.trim().toLowerCase();


            if (
                !normalizedEmail &&
                !normalizedUsername
            ) {
                throw new ApiError(
                    400,
                    "Email is required"
                );
            }


            if (!password) {
                throw new ApiError(
                    400,
                    "Password is required"
                );
            }


            /*
            |--------------------------------------------------------------------------
            | FIND USER
            |--------------------------------------------------------------------------
            |
            | Email is always searched in lowercase because registration
            | stores email in lowercase.
            |
            */

            let user = null;


            if (normalizedEmail) {

                user =
                    await User.findOne({
                        email:
                            normalizedEmail
                    });

            } else if (normalizedUsername) {

                user =
                    await User.findOne({
                        username:
                            normalizedUsername
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | USER NOT FOUND
            |--------------------------------------------------------------------------
            */

            if (!user) {
                throw new ApiError(
                    404,
                    "Account not found. Please register first."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK PASSWORD
            |--------------------------------------------------------------------------
            */

            const isPasswordValid =
                await user.isPasswordCorrect(
                    password
                );


            if (!isPasswordValid) {
                throw new ApiError(
                    401,
                    "Invalid email or password."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | GENERATE TOKENS
            |--------------------------------------------------------------------------
            */

            const {
                accessToken,
                refreshToken
            } =
                await generateAccessAndRefreshTokens(
                    user._id
                );


            /*
            |--------------------------------------------------------------------------
            | GET SAFE USER DATA
            |--------------------------------------------------------------------------
            */

            const loggedInUser =
                await User.findById(
                    user._id
                ).select(
                    "-password -refreshToken"
                );


            /*
            |--------------------------------------------------------------------------
            | COOKIE OPTIONS
            |--------------------------------------------------------------------------
            */

            const options = {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production"
            };


            /*
            |--------------------------------------------------------------------------
            | LOGIN RESPONSE
            |--------------------------------------------------------------------------
            */

            return res
                .status(200)
                .cookie(
                    "accessToken",
                    accessToken,
                    options
                )
                .cookie(
                    "refreshToken",
                    refreshToken,
                    options
                )
                .json(
                    new ApiResponse(
                        200,
                        {
                            user:
                                loggedInUser,

                            accessToken,

                            refreshToken
                        },
                        "User logged in successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| SEND PASSWORD RESET OTP
|--------------------------------------------------------------------------
*/

const sendPasswordResetOtp =
    asyncHandler(
        async (req, res) => {

            const { email } = req.body;

            if (!email?.trim()) {
                throw new ApiError(
                    400,
                    "Please enter your email address."
                );
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const user =
                await User.findOne({
                    email: normalizedEmail
                });

            if (!user) {
                throw new ApiError(
                    404,
                    "No account was found with this email address."
                );
            }

            const otp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            await PasswordResetOtp.findOneAndUpdate(
                {
                    email: normalizedEmail
                },
                {
                    email: normalizedEmail,
                    otp,
                    expiresAt,
                    verified: false
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            await sendOtpEmail(
                normalizedEmail,
                otp
            );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "Password reset OTP sent to your email."
                )
            );
        }
    );


/*
|--------------------------------------------------------------------------
| VERIFY PASSWORD RESET OTP
|--------------------------------------------------------------------------
*/

const verifyPasswordResetOtp =
    asyncHandler(
        async (req, res) => {

            const {
                email,
                otp
            } = req.body;

            if (
                !email?.trim() ||
                !otp?.trim()
            ) {
                throw new ApiError(
                    400,
                    "Email and OTP are required."
                );
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const resetOtp =
                await PasswordResetOtp.findOne({
                    email: normalizedEmail
                });

            if (!resetOtp) {
                throw new ApiError(
                    404,
                    "OTP not found. Please request a new OTP."
                );
            }

            if (
                resetOtp.expiresAt <
                new Date()
            ) {
                await PasswordResetOtp.deleteOne({
                    _id: resetOtp._id
                });

                throw new ApiError(
                    400,
                    "OTP has expired. Please request a new OTP."
                );
            }

            if (
                resetOtp.otp !==
                otp.trim()
            ) {
                throw new ApiError(
                    400,
                    "Incorrect OTP. Please enter the code sent to your email."
                );
            }

            resetOtp.verified = true;

            await resetOtp.save();

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "OTP verified successfully."
                )
            );
        }
    );


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

const resetPassword =
    asyncHandler(
        async (req, res) => {

            const {
                email,
                newPassword
            } = req.body;

            if (
                !email?.trim() ||
                !newPassword
            ) {
                throw new ApiError(
                    400,
                    "Email and new password are required."
                );
            }

            if (
                newPassword.length < 6
            ) {
                throw new ApiError(
                    400,
                    "Password must be at least 6 characters."
                );
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const resetOtp =
                await PasswordResetOtp.findOne({
                    email: normalizedEmail,
                    verified: true
                });

            if (!resetOtp) {
                throw new ApiError(
                    400,
                    "Please verify the OTP before resetting your password."
                );
            }

            if (
                resetOtp.expiresAt <
                new Date()
            ) {
                await PasswordResetOtp.deleteOne({
                    _id: resetOtp._id
                });

                throw new ApiError(
                    400,
                    "Password reset session has expired. Please request a new OTP."
                );
            }

            const user =
                await User.findOne({
                    email: normalizedEmail
                });

            if (!user) {
                throw new ApiError(
                    404,
                    "Account not found."
                );
            }

            user.password =
                newPassword;

            user.refreshToken =
                undefined;

            await user.save();

            await PasswordResetOtp.deleteOne({
                _id: resetOtp._id
            });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "Password reset successfully. You can now login."
                )
            );
        }
    );

const logoutUser =
    asyncHandler(
        async (req, res) => {

            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $unset: {
                        refreshToken: 1
                    }
                },
                {
                    new: true
                }
            );


            const options = {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production"
            };


            return res
                .status(200)
                .clearCookie(
                    "accessToken",
                    options
                )
                .clearCookie(
                    "refreshToken",
                    options
                )
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "User logged out"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

const refreshAccessToken =
    asyncHandler(
        async (req, res) => {

            const incomingRefreshToken =
                req.cookies?.refreshToken ||
                req.body?.refreshToken;


            if (!incomingRefreshToken) {

                throw new ApiError(
                    401,
                    "Unauthorized request"
                );
            }


            try {

                const decodedToken =
                    jwt.verify(
                        incomingRefreshToken,
                        process.env
                            .REFRESH_TOKEN_SECRET
                    );


                const user =
                    await User.findById(
                        decodedToken?._id
                    );


                if (!user) {

                    throw new ApiError(
                        401,
                        "Invalid refresh token"
                    );
                }


                if (
                    incomingRefreshToken !==
                    user?.refreshToken
                ) {

                    throw new ApiError(
                        401,
                        "Refresh token is expired or used"
                    );
                }


                const options = {
                    httpOnly: true,
                    secure:
                        process.env.NODE_ENV ===
                        "production"
                };


                const {
                    accessToken,
                    refreshToken
                } =
                    await generateAccessAndRefreshTokens(
                        user._id
                    );


                return res
                    .status(200)
                    .cookie(
                        "accessToken",
                        accessToken,
                        options
                    )
                    .cookie(
                        "refreshToken",
                        refreshToken,
                        options
                    )
                    .json(
                        new ApiResponse(
                            200,
                            {
                                accessToken,
                                refreshToken
                            },
                            "Access token refreshed"
                        )
                    );

            } catch (error) {

                throw new ApiError(
                    401,
                    error?.message ||
                    "Invalid refresh token"
                );
            }
        }
    );


/*
|--------------------------------------------------------------------------
| CHANGE CURRENT PASSWORD
|--------------------------------------------------------------------------
*/

const changeCurrentPassword =
    asyncHandler(
        async (req, res) => {

            const {
                oldPassword,
                newPassword
            } = req.body;


            if (
                !oldPassword ||
                !newPassword
            ) {

                throw new ApiError(
                    400,
                    "Old password and new password are required"
                );
            }


            const user =
                await User.findById(
                    req.user?._id
                );


            if (!user) {

                throw new ApiError(
                    404,
                    "User not found"
                );
            }


            const isPasswordCorrect =
                await user.isPasswordCorrect(
                    oldPassword
                );


            if (!isPasswordCorrect) {

                throw new ApiError(
                    400,
                    "Invalid old password"
                );
            }


            user.password =
                newPassword;


            await user.save({
                validateBeforeSave: false
            });


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Password changed successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

const getCurrentUser =
    asyncHandler(
        async (req, res) => {

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        req.user,
                        "Current user fetched successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| UPDATE ACCOUNT
|--------------------------------------------------------------------------
*/

const updateAccountDetails =
    asyncHandler(
        async (req, res) => {

            const {
                fullName,
                email
            } = req.body;


            if (
                !fullName &&
                !email
            ) {

                throw new ApiError(
                    400,
                    "At least one field is required"
                );
            }


            const updateFields = {};


            if (fullName) {
                updateFields.fullName =
                    fullName;
            }


            if (email) {
                updateFields.email =
                    email;
            }


            const user =
                await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $set:
                            updateFields
                    },
                    {
                        new: true
                    }
                ).select(
                    "-password -refreshToken"
                );


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "Account details updated successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| UPDATE AVATAR
|--------------------------------------------------------------------------
*/

const updateUserAvatar =
    asyncHandler(
        async (req, res) => {

            const avatarLocalPath =
                req.file?.path;


            if (!avatarLocalPath) {

                throw new ApiError(
                    400,
                    "Avatar file is missing"
                );
            }


            const avatar =
                await uploadOnCloudinary(
                    avatarLocalPath
                );


            if (!avatar?.url) {

                throw new ApiError(
                    400,
                    "Error while uploading avatar"
                );
            }


            const user =
                await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $set: {
                            avatar:
                                avatar.url
                        }
                    },
                    {
                        new: true
                    }
                ).select(
                    "-password -refreshToken"
                );


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "Avatar image updated successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| UPDATE COVER IMAGE
|--------------------------------------------------------------------------
*/

const updateUserCoverImage =
    asyncHandler(
        async (req, res) => {

            const coverImageLocalPath =
                req.file?.path;


            if (!coverImageLocalPath) {

                throw new ApiError(
                    400,
                    "Cover image file is missing"
                );
            }


            const coverImage =
                await uploadOnCloudinary(
                    coverImageLocalPath
                );


            if (!coverImage?.url) {

                throw new ApiError(
                    400,
                    "Error while uploading cover image"
                );
            }


            const user =
                await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $set: {
                            coverImage:
                                coverImage.url
                        }
                    },
                    {
                        new: true
                    }
                ).select(
                    "-password -refreshToken"
                );


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "Cover image updated successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| USER CHANNEL PROFILE
|--------------------------------------------------------------------------
*/

const getUserChannelProfile =
    asyncHandler(
        async (req, res) => {

            const {
                username
            } = req.params;


            if (!username?.trim()) {

                throw new ApiError(
                    400,
                    "Username is missing"
                );
            }


            const channel =
                await User.aggregate([
                    {
                        $match: {
                            username:
                                username.toLowerCase()
                        }
                    },
                    {
                        $lookup: {
                            from:
                                "subscriptions",
                            localField:
                                "_id",
                            foreignField:
                                "channel",
                            as:
                                "subscribers"
                        }
                    },
                    {
                        $lookup: {
                            from:
                                "subscriptions",
                            localField:
                                "_id",
                            foreignField:
                                "subscriber",
                            as:
                                "subscribedTo"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size:
                                    "$subscribers"
                            },

                            channelsSubscribedToCount: {
                                $size:
                                    "$subscribedTo"
                            },

                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"
                                        ]
                                    },

                                    then: true,

                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            subscribersCount: 1,
                            channelsSubscribedToCount: 1,
                            isSubscribed: 1,
                            avatar: 1,
                            coverImage: 1,
                            email: 1
                        }
                    }
                ]);


            if (!channel?.length) {

                throw new ApiError(
                    404,
                    "Channel not found"
                );
            }


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        channel[0],
                        "User channel fetched successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| WATCH HISTORY
|--------------------------------------------------------------------------
*/

const getWatchHistory =
    asyncHandler(
        async (req, res) => {

            const user =
                await User.aggregate([
                    {
                        $match: {
                            _id:
                                new mongoose.Types.ObjectId(
                                    req.user._id
                                )
                        }
                    },
                    {
                        $lookup: {
                            from:
                                "videos",
                            localField:
                                "watchHistory",
                            foreignField:
                                "_id",
                            as:
                                "watchHistory",

                            pipeline: [

                                {
                                    $lookup: {
                                        from:
                                            "users",
                                        localField:
                                            "owner",
                                        foreignField:
                                            "_id",
                                        as:
                                            "owner",

                                        pipeline: [

                                            {
                                                $project: {
                                                    fullName: 1,
                                                    username: 1,
                                                    avatar: 1
                                                }
                                            }

                                        ]
                                    }
                                },

                                {
                                    $addFields: {
                                        owner: {
                                            $first:
                                                "$owner"
                                        }
                                    }
                                }

                            ]
                        }
                    }
                ]);


            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user[0]?.watchHistory || [],
                        "Watch history fetched successfully"
                    )
                );
        }
    );


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {

    registerUser,
    loginUser,
    logoutUser,
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

};