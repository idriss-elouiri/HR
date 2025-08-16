import { startOfDay, endOfDay } from "date-fns";
import Employee from "../employee/employee.models.js";
import Attendance from "./attendance.model.js";

export const getDailyAttendance = async (req, res, next) => {
  try {
    const { date = new Date().toISOString().split("T")[0], employeeId } =
      req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (employeeId) {
      query.employee = employeeId;
    }

    const attendanceRecords = await Attendance.find(query).populate({
      path: "employee",
      select: "fullName employeeId department",
      populate: {
        path: "shift",
        select: "name startTime endTime",
      },
    });

    res.status(200).json({
      success: true,
      data: attendanceRecords || [],
    });
  } catch (error) {
    next(error);
  }
};
export const checkInEmployee = async (req, res, next) => {
  try {
    const { fingerprintId, deviceId } = req.body;

    const employee = await Employee.findOne({ fingerprintId }).populate(
      "shift"
    );
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "الموظف غير مسجل",
      });
    }

    // تحديد فترة الشفت بدقة
    let startDate = startOfDay(new Date());
    let endDate = endOfDay(new Date());

    if (employee.shift) {
      const shiftStart = new Date();
      const [shiftHour, shiftMinute] = employee.shift.startTime
        .split(":")
        .map(Number);
      shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

      const shiftEnd = new Date(shiftStart);
      const [endHour, endMinute] = employee.shift.endTime
        .split(":")
        .map(Number);
      shiftEnd.setHours(endHour, endMinute, 0, 0);

      // إذا انتهى الشفت بعد منتصف الليل
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      startDate = shiftStart;
      endDate = shiftEnd;
    }

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "تم تسجيل الحضور مسبقاً اليوم",
      });
    }

    const newAttendance = new Attendance({
      employee: employee._id,
      checkIn: new Date(),
      deviceId,
      status: "حاضر",
    });

    await newAttendance.save();

    res.status(201).json({
      success: true,
      message: "تم تسجيل الحضور بنجاح",
      data: newAttendance,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOutEmployee = async (req, res, next) => {
  try {
    const { fingerprintId } = req.body;

    const employee = await Employee.findOne({ fingerprintId }).populate(
      "shift"
    );
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "الموظف غير مسجل",
      });
    }

    // استخدام الشفت لحساب فترة البحث عن الحضور
    let startDate = startOfDay(new Date());
    let endDate = endOfDay(new Date());

    if (employee.shift) {
      // نفترض الشفت يبدأ اليوم الحالي
      const shiftStart = new Date();
      const [shiftHour, shiftMinute] = employee.shift.startTime
        .split(":")
        .map(Number);
      shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

      const shiftEnd = new Date(shiftStart);
      const [endHour, endMinute] = employee.shift.endTime
        .split(":")
        .map(Number);
      shiftEnd.setHours(endHour, endMinute, 0, 0);

      // إذا انتهى الشفت بعد منتصف الليل
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      startDate = shiftStart;
      endDate = shiftEnd;
    }

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "لم يتم تسجيل الحضور اليوم",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "تم تسجيل الانصراف مسبقاً اليوم",
      });
    }

    attendance.checkOut = new Date();
    attendance.workingHours =
      (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "تم تسجيل الانصراف بنجاح",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
