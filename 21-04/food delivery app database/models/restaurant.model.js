import mongoose, { Schema, model } from "mongoose";

const restaurantSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        }
    },
    cuisineType: [{
        type: String,
        enum: ["indian", "chinese", "italian", "mexican"]
    }],
    ratingCount: {
        type: Number,
        default: 0
    },
    isOpen: {
        type: Boolean,
        default: true
    }

});

restaurantSchema.index({ "location.city": 1 });

const Restaurant = model("Restaurant", restaurantSchema);
export default Restaurant;