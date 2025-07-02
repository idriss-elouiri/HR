// controllers/report.controller.js
import Absence from "../absence/Absence.model.js"
import Leave from "../leave/leave.route.js";
import Employee from "../employee/employee.models.js";
import { errorHandler } from "../../utils/error.js";

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (!month || !year || isNaN(monthInt) || isNaN(yearInt)) {
      return next(errorHandler(400, "يجب تحديد الشهر والسنة"));
    }

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0);

    // تجميع بيانات الإجازات
    const leaves = await Leave.aggregate([
      {
        $match: {
          startDate: { $gte: startDate, $lte: endDate },
          status: "موافق عليها"
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
    const report = leaves.map(leave => {
      const absence = absences.find(a => a.employeeId === leave.employeeId) || {};
      return {
        ...leave,
        totalAbsences: absence.totalAbsences || 0,
        totalHours: absence.totalHours || 0
      };
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
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
      const absenceData = absencesReport.find(a => a._id.equals(employee._id)) || {};
      return {
        ...employee,
        ...absenceData
      };
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};