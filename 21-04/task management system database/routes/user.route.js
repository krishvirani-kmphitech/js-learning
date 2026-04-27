import { Router } from "express";
import { getUsers, getCompany } from "../controller/user.controller.js";

const router = Router();

router.get("/", getUsers);
router.get("/company", getCompany);


export default router;