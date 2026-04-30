import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";

import { ERROR_MSG, STATUS_CODE, SUCCESS_MSG } from "../constant/message.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/responceClass.js";
import { OTP_CONFIG } from "../constant/const.js";
import ApiError from "../utils/errorClass.js";
import jwt from "jsonwebtoken";

const genarateOtp = () => {
    return Math.floor((Math.random() * 9000) + 1000)
}

const sendOtp = async (email) => {

    const oldOtp = await Otp.findOne({ email }).sort({ "createdAt": -1 });

    if (oldOtp) {

        if (new Date(Date.now() - OTP_CONFIG.OTP_WINDOW_TIME) > new Date(oldOtp.windowStart)) {
            oldOtp.windowStart = new Date(),
                oldOtp.resendCount = 0,
                await oldOtp.save()
        }

        if (oldOtp.resendCount >= OTP_CONFIG.OTP_MAX_RESEND_COUNT) {
            throw ApiError.tooManyRequest(ERROR_MSG.OTP_REQUEST_TOO_MANY)
        }

        if (new Date(Date.now() - OTP_CONFIG.OTP_COOLDOWN_TIME) < new Date(oldOtp.createdAt)) {
            throw ApiError.tooManyRequest(ERROR_MSG.OTP_REQUEST_TOO_MANY)
        }

        await Otp.findByIdAndDelete(oldOtp._id);

    }

    const otp = genarateOtp();

    await Otp.create({
        otp,
        email,
        resendCount: oldOtp ? oldOtp.resendCount + 1 : 1,
        windowStart: oldOtp ? oldOtp.windowStart : new Date()
    });

}

const verifyOtp = async (res, otp, email) => {

    const otpRecord = await Otp.findOne({ otp, email });

    if (!otpRecord) {
        throw ApiError.badRequest(ERROR_MSG.OTP_NOT_GENERATE_OR_INVALID);
    }

    if (new Date(Date.now() - OTP_CONFIG.OTP_EXPIRY) > new Date(otpRecord.createdAt)) {
        throw ApiError.unauthorized(ERROR_MSG.OTP_IS_EXPIRE);
    }

    if (otpRecord.attempt >= OTP_CONFIG.OTP_MAX_ATTEMPT) {
        throw ApiError.badRequest(ERROR_MSG.OTP_ATTEMPT_TOO_MANY);
    }

    await Otp.findByIdAndDelete(otpRecord._id);

}

const registerUser = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.USER_ALREADY_EXIST))
    }

    await sendOtp(email);

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.OTP_SEND));

});

const verifyUser = asyncHandler(async (req, res) => {

    const { otp, email, userType, name, dob, gender, location, radius, password } = req.body;

    await verifyOtp(res, otp, email);

    await User.create({
        email, userType, name, dob, gender, location, radius, password
    });

    return res
        .status(STATUS_CODE.CREATED)
        .json(new ApiResponse(STATUS_CODE.CREATED, SUCCESS_MSG.USER_CREATED))

});

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
        return res
            .status(STATUS_CODE.UNAUTHORIZED)
            .json(new ApiResponse(STATUS_CODE.UNAUTHORIZED, ERROR_MSG.INVALID_USER_CREDENTIALS));
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        return res
            .status(STATUS_CODE.UNAUTHORIZED)
            .json(new ApiResponse(STATUS_CODE.UNAUTHORIZED, ERROR_MSG.INVALID_USER_CREDENTIALS))
    }

    const token = await jwt.sign(
        {
            _id: user._id,
            userType: user.userType,
        },
        process.env.JWT_KEY,
        {
            expiresIn: "3d"
        }
    );

    const cookieParams = {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }

    return res
        .cookie("token", token, cookieParams)
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.LOGIN_SUCCESS));

});

export {
    registerUser,
    verifyUser,
    loginUser
};