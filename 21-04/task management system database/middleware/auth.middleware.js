import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/errorClass.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ERROR_MSG } from "../constants/messages.js";

const authMiddleware = asyncHandler(async (req, res, next) => {

    const header = req.headers.authorization || req.cookies.token;

    if (!header) {
        throw ApiError.unauthorized(ERROR_MSG.TOKEN_NOT_FOUND);
    }

    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

    if (!token) {
        throw ApiError.unauthorized(ERROR_MSG.INVALID_TOKEN);
    }

    if (process.env.JWT_KEY) {
        throw ApiError.notFound(ERROR_MSG.JWT_KEY_MISSING);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({
        _id: decodedToken._id,
        deletedAt: null
    });

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    req.user = user;
    next();

})

export {
    authMiddleware
};