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
    phone: {
        type: Number,
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        default: null
    },
    availabilityFrom: {
        type: String,
        enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        default: null
    },
    availabilityTo: {
        type: String,
        enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        default: null
    },
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

});

userSchema.index(
    { companyId: 1, email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userType: { $in: ["guard", "client"] }
        }
    });

userSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userType: "company",
            isDeleted: { $eq: null }
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

// userSchema.pre("save", async function (next) {

//     if (this.userType !== "company") {
//         const emailExist = await User.findOne({
//             companyId: this.companyId,
//             email: this.email,
//             _id: { $ne: this._id }
//         });

//         if (emailExist) {
//             return next(new Error("This email already used in this company."))
//         }

//     } else {
//         const emailExist = await User.findOne({ email: this.email, userType: "company", _id: { $ne: this._id } });

//         if (emailExist) {
//             return next(new Error("This email already used by one company."))
//         }

//     }

//     next();

// });

const User = model("User", userSchema);
export default User;