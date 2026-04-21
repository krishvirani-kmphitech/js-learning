import mongoose, { Schema, model } from "mongoose";

const tourSchema = new Schema({
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: "Guard",
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
        min: [this.startData, "End date must be greater then start date"]
    }
});

const Tour = model("Tour", tourSchema);
export default Tour;