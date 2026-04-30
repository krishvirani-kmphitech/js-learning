import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({

    userType: {
        type: String,
        enum: ["traveller", "pilot"],
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
        // [ <longitude>, <latitude> ]
        // Valid longitude values are between -180 and 180
        // Valid latitude values are between -90 and 90
    },
    radius: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function () {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const user = model("user", userSchema);
export default user;