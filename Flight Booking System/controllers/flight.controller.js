import { ERROR_MSG, STATUS_CODE, SUCCESS_MSG } from "../constant/message.js";
import Flight from "../models/flight.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/responceClass.js";

const addFlight = asyncHandler(async (req, res) => {

    const { name, startTime, endTime, toLong, toLati, fromLong, fromLati, totalSeat, totalFlightCost } = req.body;
    const userId = req.user._id;

    const toLocation = {
        type: "Point",
        coordinates: [toLong, toLati]
    };

    const fromLocation = {
        type: "Point",
        coordinates: [fromLong, fromLati]
    };

    const flight = await Flight.create({
        pilotId: userId,
        name,
        startTime,
        endTime,
        toLocation,
        fromLocation,
        totalSeat,
        totalFlightCost
    });

    const { createdAt, updatedAt, __v, ...cleanFlight } = flight._doc;

    return res
        .status(STATUS_CODE.CREATED)
        .json(new ApiResponse(STATUS_CODE.CREATED, SUCCESS_MSG.FLIGHT_CREATED, cleanFlight));

});

const getFlight = asyncHandler(async (req, res) => {

    const flightList = await Flight.find
        ({
            startTime: { $gt: new Date() },
            status: "pending"
        })
        .select("-totalFlightCost -pilotId -createdAt -updatedAt -__v");

    if (flightList.length === 0) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
    }

    flightList.forEach((flight) => {
        const flightDoc = flight._doc;
        flightDoc.availableSeat = flight.totalSeat - (flight.bookedSeat + 1);
        delete flightDoc.totalSeat;
    });

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.FLIGHT_DATA_FETCH, { list: flightList }))

});

const getFlightNearMe = asyncHandler(async (req, res) => {

    const user = req.user;

    const flightList = await Flight
        .find({
            toLocation: {
                $geoWithin: {
                    $centerSphere: [[user.location.coordinates[0], user.location.coordinates[1]], (user.radius / 1000) / 6378.1]
                }
            },
            status: "pending"
        })
        .select("-totalFlightCost -pilotId -createdAt -updatedAt -__v");

    if (flightList.length === 0) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
    }

    flightList.forEach((flight) => {

        let flightDoc = flight._doc;

        flightDoc.availableSeat = flight.totalSeat - (flight.bookedSeat + 1);
        delete flightDoc.totalSeat;

    });

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.FLIGHT_DATA_FETCH, { list: flightList }));

});

const getFlightDetails = asyncHandler(async (req, res) => {

    const { flightId } = req.params;

    const flight = await Flight.findById(flightId).select("-__v -createdAt -updatedAt");

    if (!flight) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
    }

    if (flight.status !== "pending") {
        return res
            .status(STATUS_CODE.BAD_REQUEST)
            .json(new ApiResponse(STATUS_CODE.BAD_REQUEST, ERROR_MSG.FLIGHT_ALREADY_STARTED_OR_COMPLATED))
    }

    const { totalFlightCost, totalSeat, pilotId, ...flightDetails } = flight._doc;

    flightDetails.availableSeat = flight.totalSeat - (flight.bookedSeat + 1);

    let seatPrices = {};

    for (let i = 1; i <= flightDetails.availableSeat; i++) {
        seatPrices[i] = (flight.totalFlightCost / (i + 1)).toFixed(2);
    }

    flightDetails.NoOfSeatPrices = seatPrices;

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.FLIGHT_DATA_FETCH, flightDetails));

});

export {
    addFlight,
    getFlight,
    getFlightDetails,
    getFlightNearMe
}