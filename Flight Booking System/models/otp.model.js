import mongoose, { Schema, model } from "mongoose";

const otpSchema = new Schema({

    otp: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    attempt: {
        type: Number,
        default: 0
    },
    resendCount: {
        type: Number,
        default: 0
    },
    windowStart: {
        type: Date,
        required: true
    }

}, { timestamps: true });

const otp = model("otp", otpSchema);
export default otp;