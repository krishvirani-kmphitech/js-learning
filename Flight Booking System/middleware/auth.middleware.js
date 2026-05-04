import User from "../models/user.model.js";
import ApiError from "../utils/errorClass.js";
import { ERROR_MSG, STATUS_CODE } from "../constant/message.js";
import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/responceClass.js";

const authMiddleware = asyncHandler(async (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.TOKEN_NOT_FOUND));
    }

    if (!process.env.JWT_KEY) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.JWT_KEY_MISSING));
    }

    const decoded = await jwt.verify(token, process.env.JWT_KEY);

    if (!decoded) {
        return res
            .status(STATUS_CODE.UNAUTHORIZED)
            .json(new ApiResponse(STATUS_CODE.UNAUTHORIZED, ERROR_MSG.TOKEN_IS_INVALID));
    }

    const user = await User.findOne({ _id: decoded._id, deletedAt: null }).select("-password");

    if (!user) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(ERROR_MSG.USER_NOT_FOUND));
    }

    req.user = user;
    next();

});

const checkUserType = (userType) => asyncHandler((req, res, next) => {

    if (req.user.userType !== userType) {
        return res
            .status(STATUS_CODE.FORBIDDEN)
            .json(new ApiResponse(STATUS_CODE.FORBIDDEN, ERROR_MSG.NOT_PERMISSION));
    }
    next();

});

export {
    authMiddleware,
    checkUserType
}   