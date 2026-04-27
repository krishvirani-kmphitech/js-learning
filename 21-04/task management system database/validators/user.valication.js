import Joi from "joi";

const userRegisterSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/).min(8).max(12).required(),
    phoneFlag: Joi.string().required(),
    phoneCode: Joi.string().pattern(/^[0-9]+$/).min(1).max(3).required(),
    password: Joi.string().required(),
    userType: Joi.string().valid("guard", "client", "company").required(),
    companyId: Joi.when("userType", {
        is: Joi.valid("guard", "client"),
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    availability: Joi.when("userType", {
        is: Joi.valid("guard"),
        then: Joi.array().items(Joi.string()).min(1).max(7).required(),
        otherwise: Joi.forbidden()
    }),
    employmentType: Joi.when("userType", {
        is: Joi.valid("guard"),
        then: Joi.string().valid("fullTime", "partTime").required(),
        otherwise: Joi.forbidden()
    }),
    maxHoursPerWeek: Joi.when("userType", {
        is: Joi.valid("guard"),
        then: Joi.number().min(10).max(40).required(),
        otherwise: Joi.forbidden()
    }),
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    userType: Joi.string().required(),
    companyId: Joi.when("userType", {
        is: Joi.valid("gaurd", "client"),
        then: Joi.required()
    }),
});

const forgetPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    otp: Joi.number().required(),
    newPassword: Joi.string().required(),
    userId: Joi.string().required()
});

const resendOtpSchema = Joi.object({
    otpType: Joi.string().valid("forget-password", "account-registration").required(),
    userId: Joi.string().required()
});

export {
    userRegisterSchema,
    userLoginSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    resendOtpSchema
}