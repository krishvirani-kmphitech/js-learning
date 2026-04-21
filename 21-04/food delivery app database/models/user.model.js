import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({

    fullName: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        unique: true,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: [
        {
            addressLine: {
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
            },
            isPrimary: {
                type: Boolean,
                default: false
            },
        }
    ],

}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

const User = model("User", userSchema);
export default User;