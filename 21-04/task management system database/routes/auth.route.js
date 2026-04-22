import { Router } from "express";
import { deleteUser, getUser, loginUser, registerUser } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/delete", authMiddleware, deleteUser);
router.get("/me", authMiddleware, getUser);

export default router;