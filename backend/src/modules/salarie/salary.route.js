import express from "express";
import {
    createSalary,
    getSalaries,
    getSalary,
    updateSalary,
    deleteSalary,
    generatePayslip,
} from "./salary.controller.js";

const router = express.Router();

router.post("/", createSalary);
router.get("/", getSalaries);
router.get("/:id", getSalary);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);
router.get("/:id/payslip", generatePayslip);

export default router;