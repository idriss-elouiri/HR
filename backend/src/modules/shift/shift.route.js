import express from 'express';
import {
  createShift,
  getShifts,
  updateShift,
  deleteShift
} from './shift.controller.js';

const router = express.Router();

router.post('/', createShift);
router.get('/', getShifts);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;