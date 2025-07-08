import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeShift
} from './employee.controller.js';
import { validateZod } from '../../middlewares/validate-zod.js';
import { employeeSchema } from './employee.schema.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

// تطبيق التحقق من الصحة والمصادقة على جميع الطرق
router.get('/', getEmployees);
router.get('/:id', getEmployee);

// طرق تحتاج مصادقة

router.post('/', validateZod(employeeSchema), verifyToken, createEmployee);
router.put('/:id', validateZod(employeeSchema.partial()), verifyToken, updateEmployee);
router.delete('/:id', verifyToken, deleteEmployee);
router.put('/:id/shift', verifyToken, updateEmployeeShift);

export default router;