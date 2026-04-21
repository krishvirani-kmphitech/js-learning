import mongoose, { Schema, model } from "mongoose";

const menuSchema = new Schema({

    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    dishName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["Starters", "Main Course", "Breads", "Rice & Biryani", "Desserts"]
    },
    type: {
        type: String,
        enum: ["veg", "non-veg", "vegan", "jain-food"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const Menu = model("Menu", menuSchema);