import express from 'express';
import {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} from './department.controller.js';

const router = express.Router();

router.post('/', createDepartment);
router.get('/', getDepartments);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;