import express from "express";
import {
  createSalary,
  getSalaries,
  getSalary,
  updateSalary,
  deleteSalary,
  generatePayslip,
  getEmployeeLastSalary,
} from "./salary.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createSalary);
router.get("/", getSalaries);
router.get("/:id", getSalary);
router.put("/:id", verifyToken, updateSalary);
router.delete("/:id", verifyToken, deleteSalary);
router.get("/:id/payslip", generatePayslip);
router.get("/employee-last/:employeeId", getEmployeeLastSalary);

export default router;
