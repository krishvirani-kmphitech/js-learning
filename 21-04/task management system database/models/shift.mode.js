import mongoose, { Schema, model } from "mongoose";

const shiftSchema = new Schema({

    shiftName: {
        type: String,
        required: true
    },
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: "Guard",
        required: true
    },
    startData: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: Date,
        min: [this.startData, "End date must be greater then start date"]
    },
    location: {
        // addressLine: {
        //     type: String,
        //     required: true
        // },
        // city: {
        //     type: String,
        //     required: true
        // },
        // pincode: {
        //     type: String,
        //     required: true
        // }
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    media: [
        {
            type: String
        }
    ]

});

const Shift = model("Shift", shiftSchema);
export default Shift;