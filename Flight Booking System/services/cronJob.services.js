import cron from 'node-cron';
import Flight from '../models/flight.model.js';
import Booking from '../models/booking.model.js';
import Transaction from '../models/transaction.model.js';
import { FLIGHT_CONFIG } from '../constant/const.js';
import mongoose from 'mongoose';

const cronJob = () => {
    cron.schedule("*/1 * * * *", async function () {

        console.log("CRON RUN 1-MIN");

        rejectPendingBooking();
        startFlight();
        complateFlight();

    });
}

async function rejectPendingBooking() {
    const time = new Date(Date.now() - FLIGHT_CONFIG.REJECT_PENDING_BOOKING_TIME);
    const bookingList = await Booking.find({ createdAt: { $lte: time }, status: "pending" });

    const session = await mongoose.startSession();

    for (let booking of bookingList) {
        try {

            session.startTransaction();

            const bookingData = await Booking.findByIdAndUpdate(
                booking._id,
                {
                    $set: {
                        status: "reject",
                        reason: "Payment not done by traveller"
                    }
                },
                { session }
            );

            const flight = await Flight.findById(bookingData.flightId);
            flight.bookedSeat -= booking.numberOfSeat;
            await flight.save({ session });

            await session.commitTransaction();
            session.endSession();

        } catch (error) {

            await session.abortTransaction();
            session.endSession();

        }

        console.log("Booking status change to reject" + booking._id);
    }

}

async function startFlight() {
    const flightData = await Flight.find({ startTime: { $lte: new Date() }, status: "pending" });

    for (let flight of flightData) {

        const session = await mongoose.startSession();

        try {

            session.startTransaction();

            const checkPendingBooking = await Booking.find({ flightId: flight._id, status: "pending" });
            if (checkPendingBooking.length >= 1) {

                for (let booking of checkPendingBooking) {
                    booking.status = "reject";
                    booking.reason = "payment not done and flight start"
                    await booking.save({ session });

                    flight.bookedSeat -= booking.numberOfSeat;
                    await flight.save({ session });

                    console.log("Booking reject due to fligh start : " + booking._id);
                }

            }

            // total booked seats and final seats price
            const totalBookedSeats = flight.bookedSeat + 1;
            const finalSeatPrice = flight.totalFlightCost / totalBookedSeats;

            // flight cancel if 0 seat book
            if (totalBookedSeats === 1) {
                flight.status = "cancel";
                flight.reason = "any flight seats not book."
                await flight.save({ session });
                console.log("flight status change to cancel : " + flight._id);
            }
            else {

                const bookingOnThisFlight = await Booking.find({ flightId: flight._id, status: "confirm" });

                for (let booking of bookingOnThisFlight) {

                    // calculate refund amount
                    const extraAmountPerSeat = booking.estimatedSeatPrice - finalSeatPrice;
                    const refundAmount = (extraAmountPerSeat * booking.numberOfSeat).toFixed(2);

                    // refund amount
                    await Transaction.create([{
                        travellerId: booking.travellerId,
                        flightId: booking.flightId,
                        bookingId: booking._id,
                        flightName: booking.flightName,
                        type: "refund",
                        amount: refundAmount
                    }], { session });

                    // add finalSeat Price and refund amount
                    booking.finalSeatPrice = finalSeatPrice;
                    booking.refundAmount = refundAmount;
                    booking.status = "settled";
                    await booking.save({ session });

                    console.log("settled this booking : " + booking._id);

                }

                const pilotTotalIncome = flight.totalFlightCost - finalSeatPrice;

                const pilotSattlement = await Transaction.create([{
                    pilotId: flight.pilotId,
                    flightId: flight._id,
                    flightName: flight.name,
                    type: "pay",
                    amount: pilotTotalIncome
                }], { session });

                console.log("pilot settled : " + pilotSattlement[0]._id);


                // flight status change to started
                flight.status = "started";
                await flight.save({ session });
                console.log("flight status change to started : " + flight._id);

            }

            await session.commitTransaction();
            session.endSession();

        }
        catch (error) {

            await session.abortTransaction();
            session.endSession();

            console.log("ERROR : FLIGHT START CRON : " + flight._id);

        }

    }
}

async function complateFlight() {
    const flightData = await Flight.find({ endTime: { $lte: new Date() }, status: "started" });

    flightData.forEach(async (flight) => {
        flight.status = "completed";
        await flight.save();
        console.log("flight status change to completed : " + flight._id);
    });
}


export {
    cronJob
};