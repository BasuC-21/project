import mongoose, { Schema } from "mongoose";

const registrationOtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete expired OTP documents
registrationOtpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export const RegistrationOtp =
    mongoose.model(
        "RegistrationOtp",
        registrationOtpSchema
    );