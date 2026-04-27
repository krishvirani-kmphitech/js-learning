import mongoose, { Schema, model } from "mongoose";

const otpSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    email: {
        type: String,
        default: null
    },
    userType: {
        type: String,
        enum: ["company", "guard", "client"]
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        defualt: "user"
    },
    otp: {
        type: String,
        required: true
    },
    otpType: {
        type: String,
        enum: ["forget-password", "account-registration"],
        required: true
    },
    generatedAt: {
        type: Date,
        required: true
    },
    resendCount: {
        type: Number,
        default: 0
    },
    resendWindowStart: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    otpUsedAt: {
        type: Date,
        default: null
    }

});

otpSchema.index(
    { email: 1, otpType: 1, otpUsedAt: 1 },
    {
        unique: true,
        partialFilterExpression: {
            otpUsedAt: { $eq: null }
        }
    }
)

const otp = model("otp", otpSchema);
export default otp;