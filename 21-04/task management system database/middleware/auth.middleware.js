import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {

    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(400).json({
                success: false,
                message: "Token not found"
            })
        }

        const token = header.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token not found"
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);

        console.log(decodedToken);

        const user = await User.findById(decodedToken._id, "-password");

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User not exists"
            });
        }

        req.user = user;
        next();
    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error ? error?.message : "something went to wrong"
        });

    }

}

export {
    authMiddleware
};