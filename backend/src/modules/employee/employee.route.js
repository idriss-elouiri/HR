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

const router = express.Router();

// تطبيق التحقق من الصحة والمصادقة على جميع الطرق

router.route('/')
  .post(validateZod(employeeSchema), createEmployee)
  .get(getEmployees);

router.route('/:id')
  .get(getEmployee)
  .put(validateZod(employeeSchema.partial()), updateEmployee)
  .delete(deleteEmployee);

router.put('/:id/shift', updateEmployeeShift);

export default router;