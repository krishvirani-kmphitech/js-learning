import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/errorClass.js";
import ApiResponse from "../utils/responceClass.js";
import bcrypt from "bcrypt";

const generateOtp = () => {
    const otp = Math.floor(Math.random() * 900000) + 100000;
    return otp;
}

const sendOtp = async (userId, otpType) => {
    try {

        const otpRecord = await Otp.findOne({
            userId,
            otpType,
            otpUsedAt: null
        });

        if (otpRecord) {

            if (otpRecord.generatedAt > Date.now() - Number(process.env.OTP_COOLDOWN)) {
                throw new ApiError(429, "Please wait before requesting another OTP");
            }

            if (otpRecord.resendWindowStart < Date.now() - Number(process.env.OTP_RESEND_WINDOW)) {
                otpRecord.resendCount = 0;
                otpRecord.resendWindowStart = Date.now();
                await otpRecord.save();
            }

            if (otpRecord.resendCount >= 5) {
                throw new ApiError(429, "OTP limit exceeded. Try again later");
            }

            await Otp.findByIdAndDelete(
                otpRecord._id
            );

        }

        const otp = generateOtp();
        console.log("OTP : " + otp);
        const hashOtp = await bcrypt.hash(String(otp), 10);

        await Otp.create({
            userId,
            otp: hashOtp,
            otpType,
            generatedAt: Date.now(),
            resendCount: otpRecord ? otpRecord.resendCount + 1 : 1,
            resendWindowStart: otpRecord?.resendWindowStart || Date.now()
        });

    } catch (error) {
        // console.log("-----------sendOtp function------------");
        // console.error(error);
        throw error;
    }

}

const verifyOtp = async (userId, otp, otpType) => {

    try {
        const activeOtp = await Otp.findOne({
            userId,
            otpType,
            otpUsedAt: null,
            // generatedAt: { $gt: Date.now() - 5 * 60 * 1000 }
            generatedAt: { $gt: Date.now() - Number(process.env.OTP_EXPIRY) }
        });

        if (!activeOtp) {
            throw new ApiError(400, "OTP not found or OTP is expired");
        }

        if (activeOtp.attempts >= 5) {
            throw new ApiError(429, "Too many attempts. OTP blocked.");
        }

        const isOtpCorrect = await bcrypt.compare(String(otp), activeOtp.otp);

        if (!isOtpCorrect) {

            activeOtp.attempts += 1;
            await activeOtp.save();

            throw new ApiError(400, "OTP is incorrect");
        }

        await Otp.findByIdAndDelete(activeOtp._id);

    } catch (error) {
        throw error;
    }

}

const resendOtp = async (req, res, next) => {

    try {
        const { userId, otpType } = req.body;

        const otpRecord = await Otp.findOne({
            userId,
            otpType,
            otpUsedAt: null
        });

        if (!otpRecord) {
            return next(new ApiError(400, "No active OTP process found"))
        }

        await sendOtp(userId, otpType);

        return res
            .status(200)
            .json(new ApiResponse(200, "OTP resend successfully"));

    } catch (error) {
        next(error);
    }

}

const registerUser = async (req, res, next) => {

    try {
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
                return next(new ApiError(404, "company not exist"));
            }

            if (company.userType !== "company") {
                return next(new ApiError(400, "user's role is not company"));
            }

        }

        const user = await User.create(req.body);

        await sendOtp(user._id, "account-registration");

        return res
            .status(201)
            .json(new ApiResponse(201, "Account created and otp generated"));


    } catch (error) {
        console.log("error : " + error);
        next(error);
    }

};

const verifyUser = async (req, res, next) => {

    try {
        const { userId, otp, otpType } = req.body;

        await verifyOtp(userId, otp, otpType);

        await User.findByIdAndUpdate(
            userId,
            {
                verifiedAt: Date.now()
            }
        );

        return res
            .status(200)
            .json(new ApiResponse(200, "User verify successfully"));

    } catch (error) {
        next(error);
    }

}

const loginUser = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, deletedAt: null });

        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        if (user.verifiedAt == null) {
            return next(new ApiError(403, "User not verified by otp"));
        }

        if (!(await user.comparePassword(password))) {
            return next(new ApiError(401, "Email or password are wrong"));
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

        return res
            .status(200)
            .cookie("token", token,
                { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true }
            )
            .json(new ApiResponse(200, "Login successfully done", { user: clearUser, token }));

    } catch (error) {
        next(error);
    }

}

const logoutUser = async (req, res, next) => {

    return res
        .status(200)
        .clearCookie("token")
        .json(new ApiResponse(200, "Logout successfully done"));

}

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email, deletedAt: null });

        if (!user) {
            return next(new ApiError(400, "User not found"));
        }

        await sendOtp(user._id, "forget-password");

        return res
            .status(200)
            .json(new ApiResponse(200, "OTP generated successfully"));

    } catch (error) {
        // console.log("-----------forget function------------");
        // console.error(error);
        next(error);
    }

};

const resetPassword = async (req, res, next) => {

    try {

        const { userId, otp, newPassword } = req.body;

        await verifyOtp(userId, otp, "forget-password");

        const hashNewPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(
            userId,
            {
                password: hashNewPassword
            }
        );

        return res
            .status(200)
            .json(new ApiResponse(200, "Password reset successfully"));


    } catch (error) {
        next(error);
    }

}

const deleteUser = async (req, res, next) => {

    try {
        const { _id } = req.user;

        await User.findByIdAndUpdate(
            _id,
            {
                deletedAt: new Date()
            }
        )

        return res
            .status(200)
            .json(new ApiResponse(200, "User deleted successfully"));
    } catch (error) {
        next(error);
    }

};

const getUser = async (req, res, next) => {

    return res
        .status(200)
        .json(new ApiResponse(200, "Data get successfully", { user: req.user }));

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