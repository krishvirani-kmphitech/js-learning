import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {

    try {
        const {
            name,
            email,
            phone,
            password,
            userType,
            companyId,
            availabilityFrom,
            availabilityTo,
            employmentType,
            maxHoursPerWeek
        } = req.body;

        if (!name || !email || !phone || !password || !userType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (userType !== "company") {

            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: "company id is required for guard and client"
                });
            }

            const company = await User.findById(companyId);

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: "company not exist"
                });
            }

            if (company.userType !== "company") {
                return res.status(404).json({
                    success: false,
                    message: "user's role is not company"
                });
            }

        }

        await User.create({
            name,
            email,
            phone,
            password,
            userType,
            companyId,
            availabilityFrom,
            availabilityTo,
            employmentType,
            maxHoursPerWeek
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        });


    } catch (error) {
        console.log("error : " + error);
        res.status(400).json({
            success: false,
            message: error ? error?.message : "something went to wrong"
        })
    }

};

const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email, isDeleted: null });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email or password are wrong"
            });
        }

        if (!(await user.comparePassword(password))) {
            return res.status(400).json({
                success: true,
                message: "Password is wrong"
            });
        }

        const token = await jwt.sign(
            {
                _id: user._id,
                role: user.userType,
                company_id: user.companyId
            },
            process.env.JWT_KEY,
            {
                expiresIn: "3d"
            }
        );

        const { password: pwd, ...clearUser } = user._doc;

        return res.status(200).json({
            success: true,
            data: clearUser,
            token
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Something went to wrong"
        });

    }

}

const deleteUser = async (req, res) => {

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        {
            deletedAt: new Date()
        }
    )

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });

};

const getUser = async (req, res) => {

    return res.status(200).json({
        success: true,
        data: req.user
    });

}


export {
    registerUser,
    loginUser,
    getUser,
    deleteUser
};