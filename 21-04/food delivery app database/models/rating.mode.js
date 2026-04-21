import mongoose, { Schema, model } from "mongoose";

const ratingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }

}, { timestamps: true });

ratingSchema.index({ restaurant: 1, user: 1 }, { unique: true });

const Rating = model("Rating", ratingSchema);
export default Rating;