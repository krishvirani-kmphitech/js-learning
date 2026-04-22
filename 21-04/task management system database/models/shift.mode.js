import mongoose, { Schema, model } from "mongoose";

const shiftSchema = new Schema({

    shiftName: {
        type: String,
        required: true
    },
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startData: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: Date,
        validate: {
            validator: function (endDate) {
                if (endDate < this.startDate) {
                    return false;
                }
            },
            message: "we need end date greater then start date"
        }
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