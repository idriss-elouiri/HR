// routes/report.route.js
import express from "express";
import {
  getMonthlyReport,
  getAnnualReport
} from "./report.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/monthly", verifyToken, getMonthlyReport);
router.get("/annual/:year", verifyToken, getAnnualReport);

export default router;