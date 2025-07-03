import express from 'express';
import {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} from './department.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createDepartment);
router.get('/', verifyToken, getDepartments);
router.put('/:id', verifyToken, updateDepartment);
router.delete('/:id', verifyToken, deleteDepartment);

export default router;