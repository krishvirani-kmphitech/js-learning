import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema({

    travellerId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        defualt: 0
    },
    pilotId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        defualt: 0
    },
    flightId: {
        type: Schema.Types.ObjectId,
        ref: "flight",
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "booking",
        defualt: 0
    },
    flightName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["pay", "refund"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    }

}, { timestamps: true });

const transaction = model("transaction", transactionSchema);
export default transaction;