import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/errorClass.js";
import { sendCreated, sendResponse, sendSuccess } from "../utils/responceClass.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import { SUCCESS_MSG, ERROR_MSG } from "../constants/messages.js";

const generateOtp = () => {
    const otp = Math.floor(Math.random() * 900000) + 100000;
    return otp;
}

const sendOtp = asyncHandler(async (userId, otpType) => {

    const otpRecord = await Otp.findOne({
        userId,
        otpType,
        otpUsedAt: null
    });

    if (otpRecord) {

        if (otpRecord.generatedAt > new Date(Date.now() - Number(process.env.OTP_COOLDOWN))) {
            throw new ApiError.tooManyRequest(ERROR_MSG.WAIT_FOR_OTP);
        }

        if (otpRecord.resendWindowStart < new Date(Date.now() - Number(process.env.OTP_RESEND_WINDOW))) {
            otpRecord.resendCount = 0;
            otpRecord.resendWindowStart = new Date();
            await otpRecord.save();
        }

        if (otpRecord.resendCount >= 5) {
            throw new ApiError.tooManyRequest(ERROR_MSG.TOO_MANY_RESEND_OTP);
        }

        await Otp.findByIdAndDelete(
            otpRecord._id
        )

    }

    const otp = generateOtp();
    console.log("OTP : " + otp);
    const hashOtp = await bcrypt.hash(String(otp), 10);

    await Otp.create({
        userId,
        otp: hashOtp,
        otpType,
        generatedAt: new Date(),
        resendCount: otpRecord ? otpRecord.resendCount + 1 : 1,
        resendWindowStart: otpRecord?.resendWindowStart || new Date()
    });

})

const verifyOtp = asyncHandler(async (userId, otp, otpType) => {

    const activeOtp = await Otp.findOne({
        userId,
        otpType,
        otpUsedAt: null,
        generatedAt: { $gt: new Date(Date.now() - Number(process.env.OTP_EXPIRY)) }
    });

    if (!activeOtp) {
        throw new ApiError.badRequest(ERROR_MSG.OTP_NOT_FOUND_OR_EXPIRE);
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

})

const resendOtp = asyncHandler(async (req, res) => {

    const { userId, otpType } = req.body;

    const otpRecord = await Otp.findOne({
        userId,
        otpType,
        otpUsedAt: null
    });

    if (!otpRecord) {
        throw ApiError.badRequest(ERROR_MSG.OTP_PROCESS_NOT_FOUND);
    }

    await sendOtp(userId, otpType);

    return sendSuccess(res, SUCCESS_MSG.OTP_RESEND);

});

const registerUser = asyncHandler(async (req, res) => {

    const {
        name,
        email,
        phoneNumber,
        phoneFlag,
        phoneCode,
        password,
        userType,
        companyId,
        availability,
        employmentType,
        maxHoursPerWeek
    } = req.body;

    if (userType !== "company") {

        const company = await User.findById(companyId);

        if (!company) {
            throw ApiError.notFound(ERROR_MSG.INVALID_COMPANY);
        }

        if (company.userType !== "company") {
            throw ApiError.notFound(ERROR_MSG.INVALID_COMPANY);
        }

    }

    const user = await User.create(req.body);

    await sendOtp(user._id, "account-registration");

    return sendCreated(res, SUCCESS_MSG.ACCOUNT_CREATE);

})

const verifyUser = asyncHandler(async (req, res) => {

    const { userId, otp, otpType } = req.body;

    await verifyOtp(userId, otp, "account-registration");

    await User.findByIdAndUpdate(
        userId,
        {
            verifiedAt: Date.now()
        }
    );

    return sendSuccess(res, SUCCESS_MSG.USER_VERIFY)

})

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    if (user.verifiedAt == null) {
        throw ApiError.forbidden(ERROR_MSG.USER_NOT_FOUND);
    }

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
    )

    return sendSuccess(res, SUCCESS_MSG.LOGIN_SUCCESS, { user: clearUser, token })

})

const logoutUser = asyncHandler(async (req, res) => {

    res.clearCookie("token")

    return sendSuccess(res, SUCCESS_MSG.LOGOUT_SUCCESS)

})

const forgetPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    await sendOtp(user._id, "forget-password");

    return sendSuccess(res, SUCCESS_MSG.OTP_GENERATED)

})

const resetPassword = asyncHandler(async (req, res) => {

    const { userId, otp, newPassword } = req.body;

    await verifyOtp(userId, otp, "forget-password");

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
        userId,
        {
            password: hashNewPassword
        }
    );

    return sendSuccess(res, SUCCESS_MSG.PASSWORD_RESET);

})

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

}


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

// make api that show company list, company - guard and client list with magination