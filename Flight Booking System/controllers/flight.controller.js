import { ERROR_MSG, STATUS_CODE, SUCCESS_MSG } from "../constant/message.js";
import Flight from "../models/flight.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/responceClass.js";

const addFlight = asyncHandler(async (req, res) => {

    const { name, startTime, endTime, toLocation, fromLocation, totalSeat, totalFlightCost } = req.body;

    const { _id } = req.user;

    await Flight.create({
        pilotId: _id,
        name,
        startTime,
        endTime,
        toLocation,
        fromLocation,
        totalSeat,
        totalFlightCost
    });

    return res
        .status(STATUS_CODE.CREATED)
        .json(new ApiResponse(STATUS_CODE.CREATED, SUCCESS_MSG.FLIGHT_CREATED));

});

const getFlight = asyncHandler(async (req, res) => {

    const flightList = await Flight.find
        ({
            startTime: { $gt: new Date() },
            status: "pending"
        })
        .select("-totalFlightCost");

    if (flightList.length === 0) {
        return res
            .status(STATUS_CODE.NOT_FOUND)
            .json(new ApiResponse(STATUS_CODE.NOT_FOUND, ERROR_MSG.FLIGHT_NOT_FOUND));
    }

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.FLIGHT_DATA_FETCH, { list: flightList }))

});

const getFlightNearMe = asyncHandler(async (req, res) => {

    const user = req.user;

    const flightList = await Flight.find({
        toLocation: {
            $geoWithin: {
                $centerSphere: [[user.location.coordinates[0], user.location.coordinates[1]], (user.radius / 1000) / 6378.1]
            }
        },
        status: "pending"
    });

    return res
        .status(STATUS_CODE.OK)
        .json(new ApiResponse(STATUS_CODE.OK, SUCCESS_MSG.FLIGHT_DATA_FETCH, { list: flightList }));

});

const getFlightDetails = asyncHandler(async (req, res) => {

    const { flightId } = req.params;

    const flight = await Flight.findById(flightId).select("-__v -createdAt -updatedAt");

    const { totalFlightCost, totalSeat, pilotId, ...flightDetails } = flight._doc;

    flightDetails.seatPrice = flight.totalFlightCost / flight.totalSeat;
    flightDetails.availableSeat = flight.totalSeat - (flight.bookedSeat + 1);

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