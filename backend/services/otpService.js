import crypto from "crypto";
import bcrypt from "bcrypt";
import OTP from "../models/OTP.js";

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and store OTP
 */
export const createTransferOTP = async ({
    userId,
    senderAccount,
    receiverAccount,
    amount,
    }) => {

    // Delete previous OTPs for this user
    await OTP.deleteMany({
        userId,
        purpose: "TRANSFER",
    });

    const otp = generateOTP();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({
        userId,
        otpHash,
        senderAccount,
        receiverAccount,
        amount,
        purpose: "TRANSFER",
        expiresAt,
    });

    return otp;
    };

    /**
     * Verify OTP
     */
    export const verifyTransferOTP = async (
    userId,
    enteredOTP
    ) => {

    const record = await OTP.findOne({
        userId,
        purpose: "TRANSFER",
    });

    if (!record) {
        return {
        success: false,
        message: "OTP not found or expired.",
        };
    }

    if (record.attempts >= 3) {

        await OTP.deleteOne({
        _id: record._id,
        });

        return {
        success: false,
        message: "Maximum OTP attempts exceeded.",
        };
    }

    const matched = await bcrypt.compare(
        enteredOTP,
        record.otpHash
    );

    if (!matched) {

        record.attempts += 1;

        await record.save();

        return {
        success: false,
        message: "Invalid OTP.",
        };
    }

    record.verified = true;

    await record.save();

    return {
        success: true,
        otpRecord: record,
    };
};

/**
 * Delete OTP after successful transfer
 */
export const deleteTransferOTP = async (
    userId
    ) => {

    await OTP.deleteMany({
        userId,
        purpose: "TRANSFER",
    });

};