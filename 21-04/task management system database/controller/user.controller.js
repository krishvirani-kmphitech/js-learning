import { SUCCESS_MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responceClass.js";

const getUsers = asyncHandler(async (req, res) => {

    const page = req.query.page || 1;
    const limit = req.query.limit || 1;

    // const allCompany = await User.find
    //     (
    //         { userType: "company" }
    //     )
    //     .skip((page - 1) * limit)
    //     .limit(limit);

    const users = await User.aggregate([
        {
            $match: {
                userType: "company"
            },
            $project: {
                password: 0,
                companyId: 0,
                availability: 0,
                employeeType: 0
            }
        }
    ]);

    return sendSuccess(res, SUCCESS_MSG.ALL_COMPANY_FOUND, { users });

});

export {
    getUsers
}