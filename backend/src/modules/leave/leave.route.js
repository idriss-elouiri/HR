// routes/leaves.route.js
import express from "express";
import {
    createLeave,
    getLeaves,
    updateLeaveStatus,
    updateLeave,
    getLeaveSummary
} from "./leave.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createLeave);
router.get("/", verifyToken, getLeaves);
router.put("/:id", verifyToken, updateLeave);
router.put("/:id/status", verifyToken, updateLeaveStatus);
router.get("/summary/:employeeId/:year", verifyToken, getLeaveSummary);

export default router;