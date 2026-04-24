import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/errorClass.js";
import { sendResponse } from "../utils/responceClass.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ERROR_MSG } from "../constants/messages.js";

const authMiddleware = asyncHandler(async (req, res, next) => {

    const header = req.headers.authorization || req.cookies.token;

    if (!header) {
        throw ApiError.unauthorized(ERROR_MSG.TOKEN_NOT_FOUND);
    }

    const token = header.startsWith("Bearer ") ? token = header.split(" ")[1] : header;

    if (!token) {
        throw ApiError.unauthorized(ERROR_MSG.INVALID_TOKEN);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({
        _id: decodedToken._id,
        deletedAT: null,
        verifiedAt: { $ne: null }
    });

    if (!user) {
        throw ApiError(ERROR_MSG.USER_NOT_FOUND);
    }

    req.user = user;
    next();

})

export {
    authMiddleware
};