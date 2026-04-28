import mongoose, { Schema, model } from "mongoose";

const flightSchema = new Schema({

    pilot: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    toLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    fromLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    totalSeat: {
        type: Number,
        required: true
    },
    bookedSeat: {
        type: Number,
        required: true
    },
    totalFlightCost: {
        type: Number,
        required: true
    }

}, { timestamps: true });

const flight = model("flight", flightSchema);
export default flight;