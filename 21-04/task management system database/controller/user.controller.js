import { SUCCESS_MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responceClass.js";

const getAllCompany = asyncHandler(async (req, res) => {

    const { start = 0, limit = 2 } = req.query;

    const allCompany = await User.find({ userType: "company" }).skip(start).limit(limit);

    return sendSuccess(res, SUCCESS_MSG.ALL_COMPANY_FOUND, { company: allCompany });

});

export {
    getAllCompany
}