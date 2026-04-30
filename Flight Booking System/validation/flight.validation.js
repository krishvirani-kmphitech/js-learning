import Joi from "joi";

const addFlightSchema = Joi.object({
    name: Joi.string().required(),

    startTime: Joi.date().required()
        .custom((value, helper) => {
            if (value < new Date()) {
                return helper.message("StartTime must be greater then currentTime");
            }
            return value;
        }),

    endTime: Joi.date().required()
        .custom((value, helper) => {
            const { startTime } = helper.state.ancestors[0];
            if (value < startTime) {
                return helper.message("EndTime must be greater then startTime")
            }
            return value
        }),

    toLocation: Joi.object({
        type: Joi.string().valid("Point").required(),
        coordinates: Joi.array().items(Joi.number()).min(2).max(2).required()
    }),
    fromLocation: Joi.object({
        type: Joi.string().valid("Point").required(),
        coordinates: Joi.array().items(Joi.number()).min(2).max(2).required()
    }),
    totalSeat: Joi.number().min(2).required(),
    totalFlightCost: Joi.number().required()
});

export {
    addFlightSchema
}