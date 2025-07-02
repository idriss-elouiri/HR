// controllers/absence.controller.js
import Absence from "./Absence.model.js";
import Employee from "../employee/employee.models.js";
import { errorHandler } from "../../utils/error.js";

export const createAbsence = async (req, res, next) => {
    try {
        const absenceData = {
            ...req.body,
            employee: req.body.employeeId,
            createdBy: req.user.id
        };

        const employee = await Employee.findById(req.body.employeeId);
        if (!employee) return next(errorHandler(404, "الموظف غير موجود"));

        // التحقق من عدم وجود غياب مسجل لنفس الموظف في نفس اليوم
        const existingAbsence = await Absence.findOne({
            employee: req.body.employeeId,
            date: {
                $gte: new Date(req.body.date).setHours(0, 0, 0, 0),
                $lt: new Date(req.body.date).setHours(23, 59, 59, 999)
            }
        });

        if (existingAbsence) {
            return next(errorHandler(400, "تم تسجيل غياب لهذا الموظف في هذا اليوم مسبقاً"));
        }

        const absence = await Absence.create(absenceData);

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