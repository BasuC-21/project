import mongoose, { Schema } from "mongoose";

const passwordResetOtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        otp: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const PasswordResetOtp =
    mongoose.model(
        "PasswordResetOtp",
        passwordResetOtpSchema
    );