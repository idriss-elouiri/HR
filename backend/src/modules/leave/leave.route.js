// routes/leaves.route.js
import express from "express";
import {
    createLeave,
    getLeaves,
    updateLeaveStatus,
    updateLeave,
    getLeaveSummary
} from "./leave.controller.js";

const router = express.Router();

router.post("/", createLeave);
router.get("/", getLeaves);
router.put("/:id", updateLeave);
router.put("/:id/status", updateLeaveStatus);
router.get("/summary/:employeeId/:year", getLeaveSummary);

export default router;