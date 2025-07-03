import Employee from '../employee/employee.models.js';
import Shift from './shift.model.js';
import { errorHandler } from '../../utils/error.js';

export const createShift = async (req, res, next) => {
    try {
        const { name, startTime, endTime, description, department } = req.body;
        const createdBy = req.user.id;

        if (!name || !startTime || !endTime) {
            return next(errorHandler(400, 'جميع الحقول المطلوبة: اسم الشفت، وقت البداية، وقت النهاية'));
        }

        const newShift = await Shift.create({
            name,
            startTime,
            endTime,
            description,
            department,
            createdBy
        });

        res.status(201).json({
            success: true,
            data: newShift
        });
    } catch (error) {
        next(error);
    }
};

export const getShifts = async (req, res, next) => {
    try {
        const shifts = await Shift.find().populate('department', 'name').populate('createdBy', 'name');
        res.status(200).json({
            success: true,
            data: shifts
        });
    } catch (error) {
        next(error);
    }
};

export const updateShift = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, description, department } = req.body;

        const updatedShift = await Shift.findByIdAndUpdate(
            id,
            { name, startTime, endTime, description, department },
            { new: true, runValidators: true }
        );

        if (!updatedShift) {
            return next(errorHandler(404, 'الشفت غير موجود'));
        }

        res.status(200).json({
            success: true,
            data: updatedShift
        });
    } catch (error) {
        next(error);
    }
};

export const deleteShift = async (req, res, next) => {
    try {
        const { id } = req.params;

        // التحقق من وجود موظفين مرتبطين بالشفت
        const employeesCount = await Employee.countDocuments({ shift: id });
        if (employeesCount > 0) {
            return next(errorHandler(400, 'لا يمكن حذف الشفت لأنه مرتبط بموظفين'));
        }
        const shift = await Shift.findByIdAndDelete(id);

        if (!shift) {
            return next(errorHandler(404, 'الشفت غير موجود'));
        }

        res.status(200).json({
            success: true,
            message: 'تم حذف الشفت بنجاح'
        });
    } catch (error) {
        next(error);
    }
};