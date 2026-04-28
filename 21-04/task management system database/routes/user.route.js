import { Router } from "express";
import { getUsersOfCompany, getCompany } from "../controller/user.controller.js";
import { authMiddleware, checkRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { getCompanyQuerySchema, getCompanySchema, getUsersOfCompanySchema } from "../validators/user.validation.js";

const router = Router();

router.get("/", authMiddleware, checkRole("company"), validate(getUsersOfCompanySchema, "query"), getUsersOfCompany);
router.get("/company", validate(getCompanySchema), validate(getCompanyQuerySchema, "query"), getCompany);

export default router;