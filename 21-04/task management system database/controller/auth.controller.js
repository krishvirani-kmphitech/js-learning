import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/errorClass.js";
import { sendCreated, sendSuccess } from "../utils/responceClass.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import { SUCCESS_MSG, ERROR_MSG } from "../constants/messages.js";

const generateOtp = () => {
    const otp = Math.floor(Math.random() * 900000) + 100000;
    return otp;
}

const sendOtp = async (email, otpType, userType, companyId = null) => {

    try {

        const otpRecord = await Otp.findOne({
            email,
            otpType,
            userType,
            companyId,
            otpUsedAt: null
        });

        if (otpRecord) {

            if (Date.now() - Number(process.env.OTP_COOLDOWN) < otpRecord.generatedAt) {
                throw ApiError.tooManyRequest(ERROR_MSG.WAIT_FOR_OTP);
            }

            if (Date.now() - Number(process.env.OTP_RESEND_WINDOW) > otpRecord.resendWindowStart) {
                otpRecord.resendCount = 0;
                otpRecord.resendWindowStart = new Date();
                await otpRecord.save();
            }

            if (otpRecord.resendCount >= Number(process.env.OTP_RESEND_COUNT)) {
                throw ApiError.tooManyRequest(ERROR_MSG.TOO_MANY_RESEND_OTP);
            }

            await Otp.findByIdAndDelete(
                otpRecord._id
            )

        }

        const otp = generateOtp();
        console.log("OTP : " + otp);
        const hashOtp = await bcrypt.hash(String(otp), 10);

        await Otp.create({
            email,
            otp: hashOtp,
            otpType,
            userType,
            companyId,
            generatedAt: new Date(),
            resendCount: otpRecord ? otpRecord.resendCount + 1 : 1,
            resendWindowStart: otpRecord?.resendWindowStart || new Date()
        });

    } catch (error) {
        throw error;
    }

}

const verifyOtp = async (email, otp, otpType, userType, companyId = null) => {

    try {

        const activeOtp = await Otp.findOne({
            email,
            otpType,
            userType,
            companyId,
            otpUsedAt: null,
            generatedAt: { $gt: new Date(Date.now() - Number(process.env.OTP_EXPIRY)) }
        });

        if (!activeOtp) {
            throw ApiError.badRequest(ERROR_MSG.OTP_NOT_FOUND_OR_EXPIRE);
        }

        if (activeOtp.attempts >= 5) {
            throw ApiError.tooManyRequest(ERROR_MSG.TOO_MANY_OTP_ATTEMPT);
        }

        const isOtpCorrect = await bcrypt.compare(String(otp), activeOtp.otp);

        if (!isOtpCorrect) {

            activeOtp.attempts += 1;
            await activeOtp.save();

            throw ApiError.badRequest(ERROR_MSG.OTP_IS_WRONG);
        }

        await Otp.findByIdAndDelete(activeOtp._id);

    } catch (error) {
        throw error;
    }

}

const registerUser = asyncHandler(async (req, res) => {

    const { email, userType, companyId } = req.body;

    if (userType !== "company") {

        const company = await User.findOne({
            _id: companyId,
            userType: "company"
        });

        if (!company) {
            throw ApiError.notFound(ERROR_MSG.INVALID_COMPANY);
        }

    }

    const query = userType === "company"
        ? { email, userType }
        : { email, userType, companyId };

    const isEmailUsed = await User.findOne(query);

    if (isEmailUsed) {
        throw ApiError.conflict(ERROR_MSG.EMAIL_ALREADY_USED);
    }

    await sendOtp(email, "account-registration", userType, companyId);

    return sendSuccess(res, SUCCESS_MSG.OTP_GENERATED);

});

const verifyUser = asyncHandler(async (req, res) => {

    const { otp, userType, name, email, password, phoneNumber, phoneFlag, phoneCode, companyId, availability, employmentType, maxHoursPerWeek } = req.body;

    await verifyOtp(email, otp, "account-registration", userType, companyId);

    const user = await User.create({
        userType,
        name,
        email,
        password,
        phoneNumber,
        phoneFlag,
        phoneCode,
        companyId,
        availability,
        employmentType,
        maxHoursPerWeek
    });

    return sendSuccess(res, SUCCESS_MSG.USER_VERIFY);

});

const resendOtp = asyncHandler(async (req, res) => {

    const { email, userType, companyId } = req.body;

    const otpRecord = await Otp.findOne({
        email,
        otpType,
        otpUsedAt: null
    });

    if (!otpRecord) {
        throw ApiError.badRequest(ERROR_MSG.OTP_PROCESS_NOT_FOUND);
    }

    await sendOtp(email, otpType);

    return sendSuccess(res, SUCCESS_MSG.OTP_RESEND);

});

const loginUser = asyncHandler(async (req, res) => {

    const { email, password, userType } = req.body;

    const query = userType === "company"
        ? { email, userType, deletedAt: null }
        : { email, usertype, companyId, deletedAt: null };

    const user = await User.findOne(query).populate("companyId", "name email");

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    // if (userType !== "company") {

    //     const companyList = await User.aggregate([
    //         {
    //             $match:
    //             {
    //                 email: "krish@gmail.com"
    //             }
    //         },
    //         {
    //             $lookup:
    //             {
    //                 from: "users",
    //                 localField: "companyId",
    //                 foreignField: "_id",
    //                 as: "company"
    //             }
    //         },
    //         {
    //             $project:
    //             {
    //                 email: "$email",
    //                 companyName: {
    //                     $first: "$company.name"
    //                 },
    //                 companyId: {
    //                     $first: "$company._id"
    //                 }
    //             }
    //         },
    //         {
    //             $addFields:
    //             {
    //                 companyDetails: {
    //                     companyId: "$companyId",
    //                     companyName: "$companyName"
    //                 }
    //             }
    //         },
    //         {
    //             $group:
    //             {
    //                 _id: "companyName",
    //                 companyList: {
    //                     $push: "$companyDetails"
    //                 }
    //             }
    //         }
    //     ]);

    //     return sendSuccess(res, SUCCESS_MSG.COMPANY_FOUND, { companyList: { ...companyList[0] } })

    // }

    if (!(await user.comparePassword(password))) {
        throw ApiError.unauthorized(ERROR_MSG.INVALID_CREDENTIALS);
    }

    const token = await jwt.sign(
        {
            _id: user._id,
            role: user.userType,
            company_id: user.companyId
        },
        process.env.JWT_KEY,
        {
            expiresIn: "3d"
        }
    );

    const { password: pwd, ...clearUser } = user._doc;

    res.cookie("token", token,
        { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true }
    );

    return sendSuccess(res, SUCCESS_MSG.LOGIN_SUCCESS, { user: clearUser });

});

const logoutUser = asyncHandler(async (req, res) => {

    res.clearCookie("token")

    return sendSuccess(res, SUCCESS_MSG.LOGOUT_SUCCESS)

});

const forgetPassword = asyncHandler(async (req, res) => {

    const { email, userType, companyId } = req.body;

    const query = userType === "company"
        ? { email, userType, deletedAt: null }
        : { email, userType, deletedAt: null, companyId };

    const user = await User.findOne(query);

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    await sendOtp(email, "forget-password", userType, companyId);

    return sendSuccess(res, SUCCESS_MSG.OTP_GENERATED)

});

const resetPassword = asyncHandler(async (req, res) => {

    const { email, userType, companyId, otp, newPassword } = req.body;

    console.log(email, userType, companyId, otp, newPassword);

    await verifyOtp(email, otp, "forget-password", userType, companyId);

    const user = await User.findOne({
        email, userType, companyId
    });

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, SUCCESS_MSG.PASSWORD_RESET);

});

const deleteUser = asyncHandler(async (req, res) => {

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        {
            deletedAt: new Date()
        }
    )

    return sendSuccess(res, SUCCESS_MSG.USER_DELETED);

});

const getUser = async (req, res) => {

    return sendSuccess(res, SUCCESS_MSG.USER_FOUND, { user: req.user });

};


export {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    forgetPassword,
    resetPassword,
    resendOtp,
    getUser,
    deleteUser
};