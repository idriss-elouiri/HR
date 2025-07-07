import express from "express";
import {
    createSalary,
    getSalaries,
    getSalary,
    updateSalary,
    deleteSalary,
    generatePayslip,
} from "./salary.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createSalary);
router.get("/", verifyToken, getSalaries);
router.get("/:id", verifyToken, getSalary);
router.put("/:id", verifyToken, updateSalary);
router.delete("/:id", verifyToken, deleteSalary);
router.get("/:id/payslip", verifyToken, generatePayslip);

export default router;