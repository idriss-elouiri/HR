import Attendance from './attendance.schema.js';
import Employee from '../employee/employee.models.js';
import Absence from "../absence/Absence.model.js";
import Leave from '../leave/Leave.model.js';
import { errorHandler } from '../../utils/error.js';
import ZKLib from 'node-zklib';

// دالة مساعدة للبحث عن الموظف باستخدام معرف البصمة
const findEmployeeByFingerprint = async (fingerprintId) => {
    if (!fingerprintId) return null;

    try {
        return await Employee.findOne({
            $or: [
                { fingerprintId: fingerprintId },
                { employeeId: fingerprintId }
            ]
        });
    } catch (error) {
        console.error('Error finding employee:', error);
        return null;
    }
};

export const syncWithDevice = async (req, res, next) => {
    try {
        const { deviceIp, devicePort = 4370 } = req.body;

        // إنشاء كائن الجهاز
        const zkInstance = new ZKLib(deviceIp, devicePort, 10000, 4000);

        try {
            // إنشاء الاتصال
            await zkInstance.createSocket();
            console.log('تم الاتصال بنجاح بجهاز البصمة');

            // جلب سجلات الحضور
            const logs = await zkInstance.getAttendances();
            console.log(`تم جلب ${logs.length} سجل حضور`);

            // معالجة البيانات
            const attendanceRecords = await Promise.all(logs.map(async log => {
                const employee = await findEmployeeByFingerprint(log.userId);

                if (!employee) {
                    console.warn(`الموظف غير موجود للرقم: ${log.userId}`);
                    return null;
                }

                return {
                    employee: employee._id,
                    date: new Date(log.timestamp),
                    checkIn: new Date(log.timestamp),
                    deviceId: log.deviceId,
                    shift: employee.shift,
                    notes: `مزامنة تلقائية من الجهاز ${deviceIp}`
                };
            }));

            // حفظ السجلات
            const validRecords = attendanceRecords.filter(record => record !== null);
            const savedRecords = await Attendance.insertMany(validRecords);
            console.log(`تم حفظ ${savedRecords.length} سجل حضور`);

            res.status(200).json({
                success: true,
                message: `تم مزامنة ${savedRecords.length} سجل حضور`,
                data: savedRecords
            });
        } catch (error) {
            console.error('خطأ في عملية المزامنة:', error);
            throw error;
        } finally {
            // قطع الاتصال في النهاية
            await zkInstance.disconnect();
            console.log('تم قطع الاتصال بجهاز البصمة');
        }
    } catch (error) {
        console.error('خطأ في المزامنة:', error);
        next(errorHandler(500, `خطأ في المزامنة: ${error.message}`));
    }
};


// حساب ساعات العمل والتأخير
const calculateAttendanceMetrics = (checkIn, shift) => {
    if (!shift) return { workingHours: 0, delay: 0, status: 'غياب' };

    const shiftStart = new Date(checkIn);
    shiftStart.setHours(...shift.startTime.split(':').map(Number));

    const shiftEnd = new Date(checkIn);
    shiftEnd.setHours(...shift.endTime.split(':').map(Number));

    const delay = Math.max(0, (checkIn - shiftStart) / (1000 * 60)); // التأخير بالدقائق

    let workingHours = 0;
    let status = 'حاضر';

    if (checkIn <= shiftEnd) {
        workingHours = (shiftEnd - checkIn) / (1000 * 60 * 60);
    }

    if (delay > 15) status = 'متأخر';
    if (workingHours < 4) status = 'غياب جزئي';

    return { workingHours, delay, status };
};

// جلب سجلات الحضور اليومية
export const getDailyAttendance = async (req, res, next) => {
    try {
        const { date = new Date() } = req.query;
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        })
            .populate('employee', 'fullName employeeId department')
            .populate('shift', 'name startTime endTime');

        // حساب المقاييس
        const processedAttendance = attendance.map(record => {
            const metrics = calculateAttendanceMetrics(
                record.checkIn,
                record.shift
            );

            return {
                ...record.toObject(),
                ...metrics
            };
        });

        res.status(200).json({
            success: true,
            data: processedAttendance
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

