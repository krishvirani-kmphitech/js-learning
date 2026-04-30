import { Router } from "express";
import { loginUser, registerUser, verifyUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginUserSchema, userRegistrationSchema, verifyUserSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/register", validate(userRegistrationSchema), registerUser);
router.post("/register/verify", validate(verifyUserSchema), verifyUser);
router.post("/login", validate(loginUserSchema), loginUser)

export default router;
