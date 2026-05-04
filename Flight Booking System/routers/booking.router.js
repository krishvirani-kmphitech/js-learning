import { Router } from "express";
import { cancelFlightBooking, flightBooking, flightBookingPayment, listFlightBooking } from "../controllers/booking.controller.js";
import { authMiddleware, checkUserType } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addFlightSchema } from "../validation/flight.validation.js";
import { flightBookingPaymentSchema, flightBookingSchema } from "../validation/booking.validation.js";

const router = Router();

router.get("/me", authMiddleware, checkUserType("traveller"), listFlightBooking);

router.post("/:flightId", authMiddleware, checkUserType("traveller"), validate(flightBookingSchema), flightBooking);
router.post("/:bookingId/payment", authMiddleware, checkUserType("traveller"), validate(flightBookingPaymentSchema), flightBookingPayment);

router.post("/:bookingId/cancel", authMiddleware, checkUserType("traveller"), cancelFlightBooking)

export default router;