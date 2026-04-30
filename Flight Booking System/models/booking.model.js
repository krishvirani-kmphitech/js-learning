import mongoose, { Schema, model } from "mongoose";

const bookingSchema = new Schema({

    travellerId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    flightId: {
        type: Schema.Types.ObjectId,
        ref: "flight",
        required: true
    },
    flightName: {
        type: String,
        required: true
    },
    numberOfSeat: {
        type: Number,
        required: true
    },
    estimatedSeatPrice: {
        type: Number,
        required: true
    },
    finalSeatPrice: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    unpaidAmount: {
        type: Number,
        required: true
    },
    depositeAmount: {
        type: Number,
        required: true
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirm", "cancel", "reject"],
        default: "pending"
    },
    reasone: {
        type: String
    }

}, { timestamps: true });

// bookingSchema.index(
//     { "createdAt": 1 },
//     {
//         expireAfterSeconds: 60,
//         partialFilterExpression: { status: "pending" }
//     }
// );

const booking = model("booking", bookingSchema);
export default booking;