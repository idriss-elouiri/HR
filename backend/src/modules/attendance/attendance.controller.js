import Attendance from './attendance.schema.js';
import Employee from '../employee/employee.models.js';
import Absence from "../absence/Absence.model.js";
import Leave from '../leave/Leave.model.js';
import { errorHandler } from '../../utils/error.js';
import ZKLib from 'node-zklib';

const calculateAttendanceMetrics = (checkIn, checkOut, shift) => {
    if (!shift) return { workingHours: 0, delay: 0, status: 'غياب' };

    const shiftStart = new Date(checkIn);
    shiftStart.setHours(...shift.startTime.split(':').map(Number), 0, 0);

    const shiftEnd = new Date(checkIn);
    shiftEnd.setHours(...shift.endTime.split(':').map(Number), 0, 0);

    const delay = Math.max(0, (checkIn - shiftStart) / (1000 * 60));

    let workingHours = 0;
    let status = 'حاضر';

    if (checkOut) {
        workingHours = (checkOut - checkIn) / (1000 * 60 * 60);
    }

    if (delay > 15) status = 'متأخر';
    if (workingHours < 4) status = 'غياب جزئي';
    if (!checkIn) status = 'غياب';

    return { workingHours, delay, status };
};

export const syncWithDevice = async (req, res, next) => {
    try {
        const { deviceIp, devicePort = 4370 } = req.body;
        const zkInstance = new ZKLib(deviceIp, devicePort, 10000, 4000);

        try {
            await zkInstance.createSocket();
            const logs = await zkInstance.getAttendances();

            const records = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const log of logs) {
                const logDate = new Date(log.timestamp);
                if (logDate < today) continue;

                const employee = await Employee.findOne({
                    $or: [
                        { fingerprintId: log.userId },
                        { employeeId: log.userId }
                    ]
                }).populate('shift');

                if (!employee) continue;

                const existing = await Attendance.findOne({
                    employee: employee._id,
                    date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
                });

                if (existing) {
                    if (!existing.checkIn || logDate < existing.checkIn) {
                        existing.checkIn = logDate;
                    }
                    if (!existing.checkOut || logDate > existing.checkOut) {
                        existing.checkOut = logDate;
                    }
                    await existing.save();
                } else {
                    records.push({
                        employee: employee._id,
                        date: logDate,
                        checkIn: logDate,
                        shift: employee.shift,
                        notes: `مزامنة تلقائية من ${deviceIp}`
                    });
                }
            }

            if (records.length > 0) {
                await Attendance.insertMany(records);
            }

            res.status(200).json({
                success: true,
                message: `تم مزامنة ${logs.length} سجل`
            });
        } finally {
            await zkInstance.disconnect();
        }
    } catch (error) {
        next(errorHandler(500, `خطأ في المزامنة: ${error.message}`));
    }
};

export const getDailyAttendance = async (req, res, next) => {
    try {
        const { date = new Date() } = req.query;
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const employees = await Employee.find().populate('shift');
        const attendance = await Attendance.find({
            date: { $gte: startDate, $lt: endDate }
        }).populate('employee', 'fullName employeeId department')
            .populate('shift', 'name startTime endTime');

        const absences = await Absence.find({
            date: { $gte: startDate, $lt: endDate },
            status: 'موافق عليها'
        });

        const leaves = await Leave.find({
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
            status: 'موافق عليها'
        });

        const result = employees.map(employee => {
            const attendanceRecord = attendance.find(a =>
                a.employee._id.toString() === employee._id.toString()
            );

            const absenceRecord = absences.find(a =>
                a.employee.toString() === employee._id.toString()
            );

            const leaveRecord = leaves.find(l =>
                l.employee.toString() === employee._id.toString()
            );

            if (leaveRecord) {
                return {
                    employee,
                    date: startDate,
                    status: 'إجازة',
                    type: leaveRecord.type,
                    workingHours: 0,
                    delay: 0
                };
            }

            if (absenceRecord) {
                return {
                    employee,
                    date: startDate,
                    status: 'غياب',
                    type: absenceRecord.type,
                    workingHours: 0,
                    delay: 0
                };
            }

            if (attendanceRecord) {
                const metrics = calculateAttendanceMetrics(
                    attendanceRecord.checkIn,
                    attendanceRecord.checkOut,
                    employee.shift
                );
                return {
                    ...attendanceRecord.toObject(),
                    ...metrics
                };
            }

            return {
                employee,
                date: startDate,
                status: 'غياب',
                workingHours: 0,
                delay: 0
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// تحديث سجل الحضور عند الانصراف
export const updateCheckOut = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { checkOut } = req.body;

        const attendance = await Attendance.findByIdAndUpdate(
            id,
            { checkOut: new Date(checkOut) },
            { new: true }
        );

        if (!attendance) {
            return next(errorHandler(404, 'سجل الحضور غير موجود'));
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// توليد تقرير الحضور
export const generateAttendanceReport = async (req, res, next) => {
    try {
        const { startDate, endDate, department } = req.query;

        const match = {};
        if (startDate && endDate) {
            match.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (department) {
            match['employee.department'] = department;
        }

        const report = await Attendance.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employee',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            { $unwind: '$employee' },
            { $match: match },
            {
                $group: {
                    _id: '$employee._id',
                    fullName: { $first: '$employee.fullName' },
                    employeeId: { $first: '$employee.employeeId' },
                    department: { $first: '$employee.department' },
                    totalPresent: {
                        $sum: { $cond: [{ $in: ['$status', 'حاضر', 'متأخر'] }, 1, 0] }
                    },
                    totalAbsent: {
                        $sum: { $cond: [{ $eq: ['$status', 'غياب'] }, 1, 0] }
                    },
                    totalDelay: { $sum: '$delay' },
                    averageWorkingHours: { $avg: '$workingHours' }
                }
            },
            { $sort: { department: 1, fullName: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

export const manualCheckIn = async (req, res, next) => {
    try {
        const { employeeId, checkInTime, notes } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(errorHandler(404, 'الموظف غير موجود'));
        }

        const newAttendance = await Attendance.create({
            employee: employeeId,
            checkIn: new Date(checkInTime),
            shift: employee.shift,
            notes: notes || 'تسجيل يدوي'
        });

        res.status(201).json({
            success: true,
            data: newAttendance
        });
    } catch (error) {
        next(error);
    }
};

// تسجيل انصراف يدوي
export const manualCheckOut = async (req, res, next) => {
    try {
        const { attendanceId, checkOutTime } = req.body;

        const attendance = await Attendance.findByIdAndUpdate(
            attendanceId,
            { checkOut: new Date(checkOutTime) },
            { new: true }
        );

        if (!attendance) {
            return next(errorHandler(404, 'سجل الحضور غير موجود'));
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

