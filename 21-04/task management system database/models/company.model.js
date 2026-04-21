import mongoose, { Schema, model } from "mongoose";

const companySchema = new Schema({

    name: {
        type: String,
        required: true
    },
    profile: {
        companyType: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
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
    phone: {
        type: String,
        required: true,
        unique: true
    },
    media: [String],

});

companySchema.index({ email: 1 });

const Company = model("Company", companySchema);
export default Company;