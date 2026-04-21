import mongoose, { Schema, model } from "mongoose";

const clientSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }

});


clientSchema.index({ email: 1, company: 1 }, { unique: true });
clientSchema.index({ mobile: 1 });

const Client = model("Client", clientSchema);
export default Client;