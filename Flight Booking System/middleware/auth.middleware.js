import User from "../models/user.model.js";
import ApiError from "../utils/errorClass.js";
import { ERROR_MSG } from "../constant/message.js";
import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        throw ApiError.unauthorized(ERROR_MSG.TOKEN_NOT_FOUND);
    }

    const decoded = await jwt.verify(token, process.env.JWT_KEY);

    if (!decoded) {
        throw ApiError.unauthorized(ERROR_MSG.TOKEN_IS_INVALID);
    }

    const user = await User.findOne({ _id: decoded._id, deletedAt: null }).select("-password");

    if (!user) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    req.user = user;
    next();

}

const checkUserType = (userType) => (req, res, next) => {

    if (req.user.userType !== userType) {
        throw ApiError.forbidden(ERROR_MSG.NOT_PERMISSION);
    }
    next();

}

export {
    authMiddleware,
    checkUserType
}   