import { Router } from "express";
import { deleteUser, forgetPassword, getUser, loginUser, logoutUser, registerUser, resendOtp, resetPassword, verifyUser } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userLoginSchema, userRegisterSchema, forgetPasswordSchema, resendOtpSchema, resetPasswordSchema } from "../validators/user.valication.js";

const router = Router();

router.post("/register", validate(userRegisterSchema), registerUser);
router.post("/verify-user", verifyUser);
router.post("/login", validate(userLoginSchema), loginUser);
router.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.post("/resend-otp", validate(resendOtpSchema), resendOtp);

router.post("/logout", authMiddleware, logoutUser);

router.post("/delete", authMiddleware, deleteUser);
router.get("/me", authMiddleware, getUser);

export default router;