// routes/report.route.js
import express from "express";
import {
  getMonthlyReport,
  getAnnualReport
} from "./report.controller.js";

const router = express.Router();

router.get("/monthly", getMonthlyReport);
router.get("/annual/:year", getAnnualReport);

export default router;