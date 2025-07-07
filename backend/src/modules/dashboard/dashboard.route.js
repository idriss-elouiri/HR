// routes/dashboard.route.js
import express from "express";
import { getDashboardData } from "./dashboard.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", getDashboardData);

export default router;