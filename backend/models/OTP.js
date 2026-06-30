import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        },

        otpHash: {
        type: String,
        required: true,
        },

        senderAccount: {
        type: String,
        required: true,
        },

        receiverAccount: {
        type: String,
        required: true,
        },

        amount: {
        type: Number,
        required: true,
        },

        purpose: {
        type: String,
        enum: ["TRANSFER"],
        default: "TRANSFER",
        },

        attempts: {
        type: Number,
        default: 0,
        },

        verified: {
        type: Boolean,
        default: false,
        },

        expiresAt: {
        type: Date,
        required: true,
        index: {
            expires: 0, // MongoDB automatically deletes expired OTPs
        },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("OTP", otpSchema);