import { Router } from "express";
import { getAllCompany } from "../controller/user.controller.js";

const router = Router();

router.get("/company", getAllCompany);

export default router;