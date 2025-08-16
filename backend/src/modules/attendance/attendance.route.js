import express from 'express';
import { 
  checkInEmployee, 
  checkOutEmployee,
  getDailyAttendance
} from './attendance.controller.js';

const router = express.Router();

router.post("/check-in", checkInEmployee);
router.post("/check-out", checkOutEmployee);
router.get("/daily", getDailyAttendance);

export default router;