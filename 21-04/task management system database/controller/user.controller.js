import mongoose, { Schema } from "mongoose";
import { ERROR_MSG, SUCCESS_MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responceClass.js";
import ApiError from "../utils/errorClass.js";

const getUsersOfCompany = asyncHandler(async (req, res) => {

    const { userType, page, limit } = req.validated.query;

    const skip = (page - 1) * limit;

    const removeFields = userType === "client"
        ? "-password -availability -employmentType -maxHoursPerWeek"
        : "-password"

    const [userList, totalUser] = await Promise.all([
        User.find({ companyId: req.user._id, userType })
            .select(removeFields)
            .skip(skip)
            .limit(limit),
        User.countDocuments({
            companyId: req.user._id,
            userType
        })
    ]);

    return sendSuccess(res, SUCCESS_MSG.ALL_COMPANY_USER_FETCH, { list: userList, totalRecords: totalUser });

});

const getCompany = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const { page, limit } = req.validated.query;
    const skip = (page - 1) * limit;

    const [userData, totalUser] = await Promise.all([
        User.find({ email })
            .skip(skip)
            .limit(limit)
            .populate("companyId", "name"),
        User.countDocuments({ email })
    ]);

    if (userData.length === 0) {
        throw ApiError.notFound(ERROR_MSG.USER_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MSG.COMPANY_FETCH, { list: userData.map(i => i.companyId), totalRecords: totalUser });

});


export {
    getUsersOfCompany,
    getCompany
}


// getCompany populate method
// const companyList = await User.aggregate([
//         {
//             $match:
//             {
//                 email
//             }
//         },
//         {
//             $lookup:
//             {
//                 from: "users",
//                 localField: "companyId",
//                 foreignField: "_id",
//                 as: "company"
//             }
//         },
//         {
//             $project:
//             {
//                 _id: 0,
//                 companyId: { $first: "$company._id" },
//                 companyName: { $first: "$company.name" }
//             }
//         }
//     ]);

// return sendSuccess(res, SUCCESS_MSG.COMPANY_FETCH, { list: companyList });

// getUserOfCompany
