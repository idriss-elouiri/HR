// routes/leaves.route.js
import express from "express";
import {
  createLeave,
  getLeaves,
  updateLeaveStatus,
  updateLeave,
  getLeaveSummary,
  deleteLeave,
} from "./leave.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createLeave);
router.get("/", getLeaves);
router.put("/:id", verifyToken, updateLeave);
router.delete("/:id", verifyToken, deleteLeave);
router.put("/:id/status", verifyToken, updateLeaveStatus);
router.get("/summary/:employeeId/:year", getLeaveSummary); // تأكد من أن المسار مطابق

export default router;
