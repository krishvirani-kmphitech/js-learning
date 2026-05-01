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

    toLong: Joi.number().required().min(-180).max(180),
    toLati: Joi.number().required().min(-90).max(90),

    fromLong: Joi.number().required().min(-180).max(180),
    fromLati: Joi.number().required().min(-90).max(90),

    totalSeat: Joi.number().min(2).required(),
    totalFlightCost: Joi.number().required()
});

export {
    addFlightSchema
}