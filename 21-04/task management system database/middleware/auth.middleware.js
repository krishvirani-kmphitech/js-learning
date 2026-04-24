import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/errorClass.js";
import ApiResponse from "../utils/responceClass.js";

const authMiddleware = async (req, res, next) => {

    try {
        const header = req.headers.authorization || req.cookies.token;

        if (!header) {
            return next(new ApiError(401, "Token not found"));
        }

        const token = header.startsWith("Bearer ") ? token = header.split(" ")[1] : header;

        if (!token) {
            return next(new ApiError(401, "Token is not valid"));
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);

        const user = await User.findOne({
            _id: decodedToken._id,
            deletedAT: null,
            verifiedAt: { $ne: null }
        });

        if (!user) {
            return next(new ApiError(401, "User not exist"));
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }

}

export {
    authMiddleware
};