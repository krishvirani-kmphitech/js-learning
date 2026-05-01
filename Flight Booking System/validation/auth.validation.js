import Joi from "joi";

const userRegistrationSchema = Joi.object({

    email: Joi.string().email().required()

});

const verifyUserSchema = Joi.object({

    otp: Joi.number().required(),
    email: Joi.string().email().required(),
    userType: Joi.string().valid("pilot", "traveller").required(),
    name: Joi.string().required(),
    dob: Joi.date().required(),
    gender: Joi.string().valid("male", "female", "other").required(),
    long: Joi.number().required().min(-180).max(180),
    lati: Joi.number().required().min(-90).max(90),
    radius: Joi.number().required(),
    password: Joi.string().required()

});

const loginUserSchema = Joi.object({

    email: Joi.string().email().required(),
    password: Joi.string().required()

})

export {
    userRegistrationSchema,
    verifyUserSchema,
    loginUserSchema
}