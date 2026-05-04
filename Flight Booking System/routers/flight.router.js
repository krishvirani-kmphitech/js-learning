import { Router } from "express";
import { addFlight, getFlight, getFlightDetails, getFlightForPilot, getFlightNearMe } from "../controllers/flight.controller.js";
import { authMiddleware, checkUserType } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addFlightSchema } from "../validation/flight.validation.js";

const router = Router();

router.post("/", authMiddleware, checkUserType("pilot"), validate(addFlightSchema), addFlight);
router.get("/pilot", authMiddleware, checkUserType("pilot"), getFlightForPilot);

router.get("/", authMiddleware, checkUserType("traveller"), getFlight);
router.get("/near-me", authMiddleware, checkUserType("traveller"), getFlightNearMe);

router.get("/:flightId", authMiddleware, checkUserType("traveller"), getFlightDetails);


export default router;