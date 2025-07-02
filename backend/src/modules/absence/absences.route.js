// routes/absences.route.js
import express from "express";
import {
  createAbsence,
  getAbsences,
  updateAbsenceStatus
} from "./absence.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createAbsence);
router.get("/", verifyToken, getAbsences);
router.put("/:id/status", verifyToken, updateAbsenceStatus);

export default router;