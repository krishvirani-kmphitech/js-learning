import { ERROR_MSG, STATUS_CODE, SUCCESS_MSG } from "../constant/message.js";
import Flight from "../models/flight.model.js";
import Booking from "../models/booking.model.js";
import Transaction from "../models/transaction.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/responceClass.js";

// booking/:flightId
// const flightBooking = asyncHandler(async (req, res) => {

//     const { flightId } = req.params;
//     const { seats } = req.body;
//     const userId = req.user._id;

//     const isBookingExistInPending = await Booking.findOne({
//         flightId,
//         travellerId: userId,
//         status: "pending"
//     });

//     if (isBookingExistInPending) {
//         return res
//             .status(STATUS_CODE.BAD_REQUEST)
//             .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.BOOKING_FOUND_IN_PENDING, isBookingExistInPending));
//     }

//     const flight = await Flight.findById(flightId);

//     if (!flight) {
//         return res
//             .status(STATUS_CODE.NOT_FOUND)
//             .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
//     }

//     if (flight.status !== "pending") {
//         return res
//             .status(STATUS_CODE.BAD_REQUEST)
//             .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.FLIGHT_ALREADY_STARTED));
//     }

//     const availableSeat = flight.totalSeat - (flight.bookedSeat + 1);
//     const isAvailableSeat = availableSeat >= seats;

//     if (!isAvailableSeat) {
//         return res
//             .status(STATUS_CODE.BAD_REQUEST)
//             .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.FLIGHT_SEATS_NOT_AVAILABLE));
//     }

//     const estimatedSeatPrice = flight.totalFlightCost / flight.totalSeat;
//     const totalAmountToPaid = estimatedSeatPrice * seats;

//     const booking = await Booking.create({
//         travellerId: userId,
//         flightId,
//         flightName: flight.name,
//         numberOfSeat: seats,
//         estimatedSeatPrice,
//         unpaidAmount: totalAmountToPaid
//     });

//     flight.bookedSeat += seats;
//     await flight.save();

//     return res
//         .status(STATUS_CODE.CREATED)
//         .json(new ApiResponse(STATUS_CODE.CREATED, SUCCESS_MSG.BOOKING_CREATED_CONFIRM_PAYMENT, booking));

// });

const flightBooking = asyncHandler(async (req, res) => {

    const { flightId } = req.params;
    const { seats } = req.body;
    const userId = req.user._id;

    const isBookingExistInPending = await Booking.findOne({
        flightId,
        travellerId: userId,
        status: "pending"
    });

    if (isBookingExistInPending) {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.BOOKING_FOUND_IN_PENDING, isBookingExistInPending));
    }

    const flight = await Flight.findById(flightId);

    if (!flight) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
    }

    if (flight.status !== "pending") {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.FLIGHT_ALREADY_STARTED));
    }

    const availableSeat = flight.totalSeat - (flight.bookedSeat + 1);
    const isAvailableSeat = availableSeat >= seats;

    if (!isAvailableSeat) {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.FLIGHT_SEATS_NOT_AVAILABLE));
    }

    const userAndPilotSeat = seats + 1;
    
    const estimatedSeatPrice = flight.totalFlightCost / flight.totalSeat;

    const remainingAmount = flight.totalFlightCost - (estimatedSeatPrice * userAndPilotSeat);

    const totalAmountToPaid = (estimatedSeatPrice + (remainingAmount / userAndPilotSeat)) * seats;

    const booking = await Booking.create({
        travellerId: userId,
        flightId,
        flightName: flight.name,
        numberOfSeat: seats,
        estimatedSeatPrice,
        depositeAmount: totalAmountToPaid - (estimatedSeatPrice * seats),
        unpaidAmount: totalAmountToPaid
    });

    flight.bookedSeat += seats;
    await flight.save();

    return res
        .status(STATUS_CODE.CREATED)
        .json(new ApiResponse(STATUS_CODE.CREATED, SUCCESS_MSG.BOOKING_CREATED_CONFIRM_PAYMENT, booking));

});

// booking/:bookingId/payment
const flightBookingPayment = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const { amount } = req.body;
    const { _id: userId } = req.user;

    const booking = await Booking.findOne({
        _id: bookingId,
        travellerId: userId,
        status: "pending"
    });

    if (!booking) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.BOOKING_NOT_FOUND))
    }

    if (amount !== booking.unpaidAmount) {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.AMOUNT_NOT_MATCH))
    }

    const tranasction = await Transaction.create({
        travellerId: userId,
        flightId: booking.flightId,
        bookingId: booking._id,
        flightName: booking.flightName,
        type: "pay",
        amount
    });

    booking.status = "confirm";
    booking.paidAmount = amount;
    booking.unpaidAmount = 0;
    await booking.save();

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.PAYMENT_DONE_BOOKING_CONFIRM, tranasction));

});

// booking/me
const listFlightBooking = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const bookingList = await Booking.find({
        travellerId: userId
    });

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.BOOKING_DATA_FETCH, { list: bookingList }));

});

// booking/:bookingId/cancel
const cancelFlightBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({
        _id: bookingId,
        travellerId: userId
    });

    if (!booking) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, SUCCESS_MSG.BOOKING_NOT_FOUND));
    }

    if (booking.status === "cancel" || booking.status === "reject") {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.BOOKING_IS_ALREADY_CANCEL));
    }
    else if (booking.status === "confirm") {

        // make refund
        await Transaction.create({
            travellerId: userId,
            flightId: booking.flightId,
            bookingId: booking._id,
            flightName: booking.flightName,
            type: "refund",
            amount: booking.paidAmount
        });

        // change booking status and money to refund
        await Booking.findByIdAndUpdate(
            booking._id,
            {
                $set: {
                    status: "cancel",
                    refundAmount: booking.paidAmount,
                    reasone: "cancel by traveller"
                }
            }
        );

    }
    else if (booking.status === "pending") {

        // change booking status
        await Booking.findByIdAndUpdate(
            booking._id,
            {
                $set: {
                    status: "cancel",
                    reasone: "cancel by traveller"
                }
            }
        );

    }

    // decress booking seat in flight
    const flight = await Flight.findById(booking.flightId);
    flight.bookedSeat -= booking.numberOfSeat;
    await flight.save();

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.BOOKING_CANCEL_SUCCESSFULLY))

});

export {
    flightBooking,
    flightBookingPayment,
    listFlightBooking,
    cancelFlightBooking
}