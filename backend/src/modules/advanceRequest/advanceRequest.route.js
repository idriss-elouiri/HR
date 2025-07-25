import express from "express";
import {
  createAdvanceRequest,
  getAdvanceRequests,
  updateAdvanceRequestStatus,
  markAdvanceAsPaid,
  deleteAdvanceRequest,
} from "./advanceRequest.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createAdvanceRequest);
router.get("/", verifyToken, getAdvanceRequests);
router.put("/:id/status", verifyToken, updateAdvanceRequestStatus);
router.put("/:id/mark-paid", verifyToken, markAdvanceAsPaid);
router.delete("/:id", verifyToken, deleteAdvanceRequest);

export default router;
