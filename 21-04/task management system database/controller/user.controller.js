import mongoose from "mongoose";
import { SUCCESS_MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responceClass.js";



const getUsers = asyncHandler(async (req, res) => {

    const page = req.query.page || 1;
    const limit = req.query.limit || 2;

    const users = await User.aggregate([
        {
            $match: {
                userType: "company"
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $project: {
                password: 0,
                companyId: 0,
                availability: 0,
                employmentType: 0
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "companyId",
                pipeline: [
                    {
                        $match: {
                            userType: "guard"
                        }
                    },
                    {
                        $project: {
                            password: 0
                        }
                    }
                ],
                as: "companyGuard",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "companyId",
                pipeline: [
                    {
                        $match: {
                            userType: "client"
                        }
                    },
                    {
                        $project: {
                            password: 0,
                            availability: 0,
                            employmentType: 0
                        }
                    }
                ],
                as: "companyClient"
            }
        },
        {
            $addFields: {
                totalGuard: { $size: "$companyGuard" },
                totalCompany: { $size: "$companyClient" }
            }
        }
    ]);

    return sendSuccess(res, SUCCESS_MSG.ALL_COMPANY_FOUND, { users });

});

const getCompany = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const list = await User.aggregate([
        {
            $match:
            {
                email
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "companyId",
                foreignField: "_id",
                as: "company"
            }
        },
        {
            $project:
            {
                email: "$email",
                companyName: {
                    $first: "$company.name"
                },
                companyId: {
                    $first: "$company._id"
                }
            }
        },
        {
            $addFields:
            {
                companyDetails: {
                    companyId: "$companyId",
                    companyName: "$companyName"
                }
            }
        },
        {
            $group:
            {
                _id: "companyName",
                companyList: {
                    $push: "$companyDetails"
                }
            }
        }
    ]);

    return sendSuccess(res, SUCCESS_MSG.COMPANY_FOUND, list);

});


export {
    getUsers,
    getCompany
}

// NOTE: getCompanyByEmail ma response array ma jose.