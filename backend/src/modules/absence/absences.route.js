// routes/absences.route.js
import express from "express";
import {
  createAbsence,
  getAbsences,
  updateAbsenceStatus
} from "./absence.controller.js";

const router = express.Router();

router.post("/", createAbsence);
router.get("/", getAbsences);
router.put("/:id/status", updateAbsenceStatus);

export default router;