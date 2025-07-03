import express from 'express';
import { 
  createShift, 
  getShifts, 
  updateShift, 
  deleteShift 
} from './shift.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createShift);
router.get('/', verifyToken, getShifts);
router.put('/:id', verifyToken, updateShift);
router.delete('/:id', verifyToken, deleteShift);

export default router;