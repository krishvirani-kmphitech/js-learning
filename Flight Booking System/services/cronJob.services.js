import cron from 'node-cron';
import Flight from '../models/flight.model.js';
import Booking from '../models/booking.model.js';
import { FLIGHT_CONFIG } from '../constant/const.js';

const cronJob = () => {
    cron.schedule("*/1 * * * *", async function () {
        console.log("CRON RUN 1");

        // change status of flight statu to started
        {
            const flightData = await Flight.find({ startTime: { $lte: new Date() }, status: "pending" });

            flightData.forEach(async (flight) => {
                flight.status = "started";
                await flight.save();
                console.log("flight status change to started" + flight._id);
            });
        }

        // change status of flight statu to completed
        // {
        //     const flightData = await Flight.find({ endTime: { $lte: new Date() }, status: "started" });

        //     flightData.forEach(async (flight) => {
        //         flight.status = "completed";
        //         await flight.save();
        //         console.log("flight status change to completed" + flight._id);
        //     });
        // }


        // reject pending booking data when not make payment by traveller
        const time = new Date(Date.now() - FLIGHT_CONFIG.REJECT_PENDING_BOOKING_TIME);
        const bookingList = await Booking.find({ createdAt: { $lte: time }, status: "pending" });

        bookingList.forEach(async (booking) => {
            const bookingData = await Booking.findByIdAndUpdate(
                booking._id,
                {
                    $set: {
                        status: "reject",
                        reasone: "Payment not done by traveller"
                    }
                }
            )

            const flight = await Flight.findById(bookingData.flightId);
            flight.bookedSeat -= booking.numberOfSeat;
            await flight.save();

            console.log("Booking status change to reject" + booking._id);
        });

    });
}

const completeFlightCronJob = () => {
    cron.schedule("*/1 * * * *", async function () {

        const flightData = await Flight.find({ endTime: { $lte: new Date() }, status: "started" });

        flightData.forEach(async (flight) => {
            flight.status = "completed";
            await flight.save();
            console.log("flight status change to completed" + flight._id);

            const totalBookedSeats = await Booking.aggregate([
                {
                    $match: {
                        flightId: flight._id
                    }
                }
            ])

        });

    })
}

export default cronJob;