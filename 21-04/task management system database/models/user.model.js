import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({

    userType: {
        type: String,
        enum: ["guard", "client", "company"],
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    phoneFlag: {
        type: String,
        required: true
    },
    phoneCode: {
        type: String,
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    availability: [String],
    employmentType: {
        type: String,
        enum: ["fullTime", "partTime"],
        default: null
    },
    maxHoursPerWeek: {
        type: Number,
        min: 10,
        max: 40
    },
    deletedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

userSchema.index(
    { companyId: 1, email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userType: { $in: ["guard", "client"] },
            deletedAt: { $eq: null }
        }
    });

userSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userType: "company",
            deletedAt: { $eq: null }
        }
    }
)

userSchema.pre("save", async function () {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = model("User", userSchema);
export default User;