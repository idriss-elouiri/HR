// controllers/absence.controller.js
import Absence from "./Absence.model.js";
import Employee from "../employee/employee.models.js";
import { errorHandler } from "../../utils/error.js";


export const createAbsence = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.body.employee);
        if (!employee) return next(errorHandler(404, "الموظف غير موجود"));

        // Ensure duration is properly handled
        const duration = req.body.type === 'غياب كامل'
            ? 8
            : parseFloat(req.body.duration);

        const absence = await Absence.create({
            ...req.body,
            duration,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: absence
        });
    } catch (error) {
        next(error);
    }
};

export const getAbsences = async (req, res, next) => {
    try {
        const { employeeId, type, status, startDate, endDate } = req.query;
        const query = {};

        if (employeeId) query.employee = employeeId;
        if (type) query.type = type;
        if (status) query.status = status;

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const absences = await Absence.find(query)
            .populate("employee", "fullName employeeId")
            .populate("approvedBy", "name")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: absences
        });
    } catch (error) {
        next(error);
    }
};

export const updateAbsenceStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const updatedAbsence = await Absence.findByIdAndUpdate(
            req.params.id,
            {
                status,
                notes,
                approvedBy: req.user.id,
                approvedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedAbsence) {
            return next(errorHandler(404, "سجل الغياب غير موجود"));
        }

        res.status(200).json({
            success: true,
            data: updatedAbsence
        });
    } catch (error) {
        next(error);
    }
};