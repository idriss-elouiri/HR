import express from "express";
import * as authController from "./auth.controller.js";
import { registerShcema, loginShcema } from "./auth.shcema.js";
import { validateZod } from "../../middlewares/validate-zod.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/register", validateZod(registerShcema), authController.register);
router.post("/login", validateZod(loginShcema), authController.login);
router.get("/logout", authController.logout);
router.put("/:userId", verifyToken, authController.updateUser);
router.get("/:userId", verifyToken, authController.getUser);
export default router;
