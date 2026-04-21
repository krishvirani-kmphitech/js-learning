import mongoose, { Schema, model } from "mongoose";

const guardSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
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
    },
    availabilityFrom: {
        type: String,
        enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sut"],
        default: "mon"
    },
    availabilityTo: {
        type: String,
        enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sut"],
        default: "sut"
    },
    employmentType: {
        type: String,
        enum: ["fullTime", "partTime"],
        default: "fullTime"
    },
    maxHoursPerWeek: {
        type: Number,
        min: 10,
        max: 40
    }

});

guardSchema.index({ email: 1, company: 1 }, { unique: true });
guardSchema.index({ phone: 1 });

const Guard = model("Guard", guardSchema);
export default Guard;