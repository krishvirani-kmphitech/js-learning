import Joi from "joi";

const getUsersOfCompanySchema = Joi.object({
    userType: Joi.string().valid("guard", "client").required(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(5)
});

const getCompanySchema = Joi.object({
    email: Joi.string().email().required()
});

const getCompanyQuerySchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(5)
});

export {
    getUsersOfCompanySchema,
    getCompanySchema,
    getCompanyQuerySchema
}