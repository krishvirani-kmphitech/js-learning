import mongoose, { Schema, model } from "mongoose";

const flightSchema = new Schema({

    pilotId: {
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
        default: 0,
        validate: {
            validator: function (bookedSeat) {
                if (bookedSeat > this.totalSeat - 1) {
                    return false;
                }
            },
            message: "Flight is full"
        }
    },
    totalFlightCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "started", "completed", "cancel"],
        default: "pending"
    },
    reason: {
        type: String
    }

}, { timestamps: true });

flightSchema.index({ fromLocation: "2dsphere" });
flightSchema.index({ toLocation: "2dsphere" });

const flight = model("flight", flightSchema);
export default flight;