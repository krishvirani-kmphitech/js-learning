import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema({

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
    items: [
        {
            dish: {
                type: Schema.Types.ObjectId,
                ref: "Menu",
                required: true
            },
            qty: {
                type: Number,
                default: 1
            },
            dishName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "placed", "preparing", "delivered"],
        default: "pending"
    }

}, { timestamps: true });

const Order = model("Order", orderSchema);
export default Order;