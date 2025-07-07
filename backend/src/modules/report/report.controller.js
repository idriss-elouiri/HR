// controllers/report.controller.js
import Absence  from "../absence/Absence.model.js";
import Leave  from "../leave/Leave.model.js";
import { errorHandler }  from "../../utils/error.js";

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (!month || !year || isNaN(monthInt) || isNaN(yearInt)) {
      return next(errorHandler(400, "يجب تحديد الشهر والسنة"));
    }

    const startDate = new Date(Date.UTC(yearInt, monthInt - 1, 1));
    const endDate = new Date(Date.UTC(yearInt, monthInt, 0));

    // تجميع بيانات الإجازات
    const leaves = await Leave.aggregate([
      {
        $match: {
          $or: [
            { startDate: { $gte: startDate, $lte: endDate }, status: "موافق عليها" },
            { endDate: { $gte: startDate, $lte: endDate }, status: "موافق عليها" }
          ]
        }
      },
      {
        $group: {
          _id: "$employee",
          totalLeaves: { $sum: "$duration" }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: "$employee"
      },
      {
        $project: {
          employeeId: "$employee.employeeId",
          fullName: "$employee.fullName",
          department: "$employee.department",
          totalLeaves: 1
        }
      }
    ]);

    // تجميع بيانات الغياب
    const absences = await Absence.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "موافق عليها"
        }
      },
      {
        $group: {
          _id: "$employee",
          totalAbsences: { $sum: 1 },
          totalHours: { $sum: "$duration" }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: "$employee"
      },
      {
        $project: {
          employeeId: "$employee.employeeId",
          fullName: "$employee.fullName",
          department: "$employee.department",
          totalAbsences: 1,
          totalHours: 1
        }
      }
    ]);

    // دمج النتائج
    const reportMap = new Map();

    // 1. دمج بيانات الإجازات
    leaves.forEach(employee => {
      reportMap.set(employee._id.toString(), {
        ...employee,
        totalAbsences: 0,
        totalHours: 0
      });
    });

    // 2. دمج بيانات الغياب
    absences.forEach(employee => {
      const id = employee._id.toString();
      if (reportMap.has(id)) {
        const existing = reportMap.get(id);
        existing.totalAbsences = employee.totalAbsences;
        existing.totalHours = employee.totalHours;
      } else {
        reportMap.set(id, {
          ...employee,
          totalLeaves: 0
        });
      }
    });

    // 3. تحويل الخريطة إلى مصفوفة
    const report = Array.from(reportMap.values());

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    next(errorHandler(500, "حدث خطأ أثناء معالجة التقرير الشهري"));
  }
};

export const getAnnualReport = async (req, res, next) => {
  try {
    const { year } = req.params;
    const yearInt = parseInt(year);

    if (!year || isNaN(yearInt)) {
      return next(errorHandler(400, "يجب تحديد السنة"));
    }

    // تقرير الإجازات السنوي
    const leavesReport = await Leave.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $year: "$startDate" }, yearInt] },
          status: "موافق عليها"
        }
      },
      {
        $group: {
          _id: {
            employee: "$employee",
            type: "$type"
          },
          totalDays: { $sum: "$duration" }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id.employee",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: "$employee"
      },
      {
        $group: {
          _id: "$employee._id",
          fullName: { $first: "$employee.fullName" },
          employeeId: { $first: "$employee.employeeId" },
          department: { $first: "$employee.department" },
          leaves: {
            $push: {
              type: "$_id.type",
              days: "$totalDays"
            }
          },
          totalLeaves: { $sum: "$totalDays" }
        }
      }
    ]);

    // تقرير الغياب السنوي
    const absencesReport = await Absence.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $year: "$date" }, yearInt] },
          status: "موافق عليها"
        }
      },
      {
        $group: {
          _id: {
            employee: "$employee",
            type: "$type"
          },
          count: { $sum: 1 },
          totalHours: { $sum: "$duration" }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id.employee",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: "$employee"
      },
      {
        $group: {
          _id: "$employee._id",
          fullName: { $first: "$employee.fullName" },
          employeeId: { $first: "$employee.employeeId" },
          department: { $first: "$employee.department" },
          absences: {
            $push: {
              type: "$_id.type",
              count: "$count",
              hours: "$totalHours"
            }
          },
          totalAbsences: { $sum: "$count" },
          totalHours: { $sum: "$totalHours" }
        }
      }
    ]);

    // دمج التقارير
    const report = leavesReport.map(employee => {
      const absenceData = absencesReport.find(a =>
        a._id && employee._id && a._id.toString() === employee._id.toString()
      ) || {};

      return {
        ...employee,
        absences: absenceData.absences || [],
        totalAbsences: absenceData.totalAbsences || 0,
        totalHours: absenceData.totalHours || 0
      };
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Annual report error:', error);
    next(errorHandler(500, "حدث خطأ أثناء معالجة التقرير السنوي"));
  }
};