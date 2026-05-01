import cron from 'node-cron';
import Flight from '../models/flight.model.js';
import Booking from '../models/booking.model.js';
import Transaction from '../models/transaction.model.js';
import { FLIGHT_CONFIG } from '../constant/const.js';
import mongoose from 'mongoose';

// const rejectPendingBooking = () => {
//     cron.schedule("*/1 * * * *", async function () {
//         console.log("REJECT BOOKING : CRON RUN");

//         // reject pending booking data when not make payment by traveller

//         const time = new Date(Date.now() - FLIGHT_CONFIG.REJECT_PENDING_BOOKING_TIME);
//         const bookingList = await Booking.find({ createdAt: { $lte: time }, status: "pending" });

//         bookingList.forEach(async (booking) => {
//             const bookingData = await Booking.findByIdAndUpdate(
//                 booking._id,
//                 {
//                     $set: {
//                         status: "reject",
//                         reason: "Payment not done by traveller"
//                     }
//                 }
//             )

//             const flight = await Flight.findById(bookingData.flightId);
//             flight.bookedSeat -= booking.numberOfSeat;
//             await flight.save();

//             console.log("Booking status change to reject" + booking._id);
//         });

//     });
// }

// const startFlightCronJob = () => {
//     cron.schedule("*/1 * * * *", async function () {

//         console.log("START FLIGHT : CRON RUN");

//         const flightData = await Flight.find({ startTime: { $lte: new Date() }, status: "pending" });

//         flightData.forEach(async (flight) => {

//             // total booked seats and final seats price
//             const totalBookedSeats = flight.bookedSeat + 1;
//             const finalSeatPrice = flight.totalFlightCost / totalBookedSeats;

//             // flight cancel if 0 seat book
//             if (totalBookedSeats === 1) {
//                 flight.status = "cancel";
//                 flight.reason = "any flight seats not book."
//                 await flight.save();
//             }

//             // flight status change to started
//             flight.status = "started";
//             await flight.save();
//             console.log("flight status change to started" + flight._id);

//             const bookingOnThisFlight = await Booking.find({ flightId: flight._id, status: "confirm" });

//             bookingOnThisFlight.forEach(async (booking) => {

//                 // calculate refund amount
//                 const extraAmountPerSeat = booking.estimatedSeatPrice - finalSeatPrice;
//                 const refundAmount = extraAmountPerSeat * booking.numberOfSeat;

//                 // refund amount
//                 await Transaction.create({
//                     travellerId: booking.travellerId,
//                     flightId: booking.flightId,
//                     bookingId: booking._id,
//                     flightName: booking.flightName,
//                     type: "refund",
//                     amount: refundAmount
//                 });


//                 // add finalSeat Price and refund amount
//                 booking.finalSeatPrice = finalSeatPrice;
//                 booking.refundAmount = refundAmount;
//                 booking.status = "settled"
//                 await booking.save();
//                 console.log("settled this booking : " + booking._id);

//             });

//         });

//     });
// }

// const completeFlightCronJob = () => {
//     cron.schedule("*/1 * * * *", async function () {

//         console.log("COMPLATE FLIGHT : CRON RUN");

//         const flightData = await Flight.find({ endTime: { $lte: new Date() }, status: "started" });

//         flightData.forEach(async (flight) => {
//             flight.status = "completed";
//             await flight.save();
//             console.log("flight status change to completed" + flight._id);
//         });

//     });
// }

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

    bookingList.forEach(async (booking) => {

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
    });
}

async function startFlight() {
    const flightData = await Flight.find({ startTime: { $lte: new Date() }, status: "pending" });

    flightData.forEach(async (flight) => {

        // total booked seats and final seats price
        const totalBookedSeats = flight.bookedSeat + 1;
        const finalSeatPrice = flight.totalFlightCost / totalBookedSeats;

        // flight cancel if 0 seat book
        if (totalBookedSeats === 1) {
            flight.status = "cancel";
            flight.reason = "any flight seats not book."
            await flight.save();
            console.log("flight status change to cancel : " + flight._id);
        }
        else {

            const bookingOnThisFlight = await Booking.find({ flightId: flight._id, status: "confirm" });

            bookingOnThisFlight.forEach(async (booking) => {

                // calculate refund amount
                const extraAmountPerSeat = booking.estimatedSeatPrice - finalSeatPrice;
                const refundAmount = (extraAmountPerSeat * booking.numberOfSeat).toFixed(2);

                const session = await mongoose.startSession();

                try {

                    session.startTransaction();

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

                    await session.commitTransaction();
                    session.endSession();

                    console.log("settled this booking : " + booking._id);

                } catch (error) {

                    await session.abortTransaction();
                    session.endSession();

                    console.log("ERROR : when refund to traveller : " + booking._id);

                }

            });

            const pilotTotalIncome = flight.totalFlightCost - finalSeatPrice;

            const pilotSattlement = await Transaction.create({
                pilotId: flight.pilotId,
                flightId: flight._id,
                flightName: flight.name,
                type: "pay",
                amount: pilotTotalIncome
            });

            console.log("pilot settled : " + pilotSattlement._id);


            // flight status change to started
            flight.status = "started";
            await flight.save();
            console.log("flight status change to started : " + flight._id);

        }

    });
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