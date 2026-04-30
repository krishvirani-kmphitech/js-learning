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
    location: Joi.object({
        type: Joi.string().valid("Point").required(),
        coordinates: Joi.array().items(Joi.number()).min(2).max(2).required()
    }),
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