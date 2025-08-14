import express from "express";
import {
  createAdvanceRequest,
  getAdvanceRequests,
  deleteAdvanceRequest,
  updateAdvanceRequest,
} from "./advanceRequest.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createAdvanceRequest);
router.get("/", getAdvanceRequests);
router.put("/:id", verifyToken, updateAdvanceRequest);
router.delete("/:id", verifyToken, deleteAdvanceRequest);

export default router;
