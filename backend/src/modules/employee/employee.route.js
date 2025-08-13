import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeShift,
  loginEmployee,
  getEmployeeByEmployeeId,
  loginHrEmployee, // إضافة الدالة الجديدة
} from "./employee.controller.js";
import { validateZod } from "../../middlewares/validate-zod.js";
import { employeeSchema } from "./employee.schema.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.post("/", validateZod(employeeSchema), verifyToken, createEmployee);
router.post("/login", loginEmployee); // تسجيل دخول الموظفين العاديين
router.post("/hr-login", loginHrEmployee); // تسجيل دخول موظفي HR
router.put(
  "/:id",
  validateZod(employeeSchema.partial()),
  verifyToken,
  updateEmployee
);
router.delete("/:id", verifyToken, deleteEmployee);
router.put("/:id/shift", verifyToken, updateEmployeeShift);
router.get("/by-employee-id/:employeeId", getEmployeeByEmployeeId);

export default router;
