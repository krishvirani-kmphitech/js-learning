import Joi from "joi";

const flightBookingSchema = Joi.object({
    seats: Joi.number().required()
});

const flightBookingPaymentSchema = Joi.object({
    amount: Joi.number().required()
});



export {
    flightBookingSchema,
    flightBookingPaymentSchema
}