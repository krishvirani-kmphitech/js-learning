import mongoose, { Schema, model } from "mongoose";

const tourSchema = new Schema({
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tourName: {
        type: String,
        required: true
    },
    startData: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (endDate) {
                if (endDate < this.startDate) {
                    return false;
                }
            },
            message: "we need end date greater then start date"
        }
    }
});

const Tour = model("Tour", tourSchema);
export default Tour;