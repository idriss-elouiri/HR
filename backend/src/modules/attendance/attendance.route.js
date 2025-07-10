import express from 'express';
import {
    syncWithDevice,
    getDailyAttendance,
    updateCheckOut,
    generateAttendanceReport,
    manualCheckIn,
    manualCheckOut
} from './attendance.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

router.post('/sync', syncWithDevice);
router.get('/daily', getDailyAttendance);
router.put('/:id/checkout', verifyToken, updateCheckOut);
router.get('/report', generateAttendanceReport);
router.post('/manual-checkin', verifyToken, manualCheckIn); // إضافة جديدة
router.post('/manual-checkout', verifyToken, manualCheckOut); // إضافة جديدة

export default router;