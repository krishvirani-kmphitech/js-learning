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
        type: String,
        required: true
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    paidAmout: {
        type: Number,
        required: true
    },
    unpaidAmout: {
        type: Number,
        required: true
    }

});

const booking = model("booking", bookingSchema);
export default booking;