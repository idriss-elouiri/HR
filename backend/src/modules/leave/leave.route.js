// routes/leaves.route.js
import express from "express";
import {
  createLeave,
  getLeaves,
  updateLeave,
  getLeaveSummary,
  deleteLeave,
  updateLeaveStatus,
} from "./leave.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createLeave);
router.get("/", getLeaves);
router.put("/:id", verifyToken, updateLeave);
router.put("/updateLeaveSt/:id", verifyToken, updateLeaveStatus);
router.delete("/:id", verifyToken, deleteLeave);
router.get("/summary/:employeeId/:year", getLeaveSummary); // تأكد من أن المسار مطابق

export default router;
