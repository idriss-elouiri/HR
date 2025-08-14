// controllers/dashboard.controller.js
import Employee from "../employee/employee.models.js";
import Absence from "../absence/Absence.model.js";
import Leave from "../leave/Leave.model.js";
import Salary from "../salarie/salary.model.js";
import { errorHandler } from "../../utils/error.js";

export const getDashboardData = async (req, res, next) => {
  try {
    // الحصول على تاريخ اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // الحصول على تاريخ أول يوم من الشهر
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // الحصول على تاريخ أول يوم من الشهر الماضي
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    // 1. عدد الموظفين
    const employeesCount = await Employee.countDocuments();
    const lastMonthEmployeesCount = await Employee.countDocuments({
      createdAt: { $lt: firstDayOfMonth },
    });
    const employeesChange =
      lastMonthEmployeesCount > 0
        ? Math.round(
            ((employeesCount - lastMonthEmployeesCount) /
              lastMonthEmployeesCount) *
              100
          )
        : 0;

    // 2. الغيابات اليوم
    const todayAbsences = await Absence.countDocuments({
      date: today,
      status: "موافق عليها",
    });
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayAbsences = await Absence.countDocuments({
      date: yesterday,
      status: "موافق عليها",
    });
    const absencesChange =
      yesterdayAbsences > 0
        ? Math.round(
            ((todayAbsences - yesterdayAbsences) / yesterdayAbsences) * 100
          )
        : 0;

    // 3. الإجازات المعتمدة
    const approvedLeaves = await Leave.countDocuments({
      status: "موافق عليها",
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
    const lastMonthApprovedLeaves = await Leave.countDocuments({
      status: "موافق عليها",
      startDate: { $lte: lastDayOfLastMonth },
      endDate: { $gte: firstDayOfLastMonth },
    });
    const leavesChange =
      lastMonthApprovedLeaves > 0
        ? Math.round(
            ((approvedLeaves - lastMonthApprovedLeaves) /
              lastMonthApprovedLeaves) *
              100
          )
        : 0;

    // 4. مجموع الرواتب هذا الشهر
    const employees = await Employee.find({}, "salary");
    const monthlySalaries = employees.reduce(
      (sum, employee) => sum + employee.salary,
      0
    );
    const lastMonthSalaries = await Employee.aggregate([
      {
        $match: {
          createdAt: { $lt: firstDayOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$salary" },
        },
      },
    ]);
    const lastMonthTotal =
      lastMonthSalaries.length > 0 ? lastMonthSalaries[0].total : 0;
    const salariesChange =
      lastMonthTotal > 0
        ? Math.round(
            ((monthlySalaries - lastMonthTotal) / lastMonthTotal) * 100
          )
        : 0;

    // 5. الموظفون النشطون اليوم
    const activeEmployees = await Employee.aggregate([
      {
        $lookup: {
          from: "leaves",
          localField: "_id",
          foreignField: "employee",
          as: "leaves",
          pipeline: [
            {
              $match: {
                status: "موافق عليها",
                startDate: { $lte: today },
                endDate: { $gte: today },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "absences",
          localField: "_id",
          foreignField: "employee",
          as: "absences",
          pipeline: [{ $match: { date: today, status: "موافق عليها" } }],
        },
      },
      {
        $match: {
          $and: [{ leaves: { $size: 0 } }, { absences: { $size: 0 } }],
        },
      },
      {
        $project: {
          name: "$fullName",
          position: "$jobTitle",
          department: "$department",
          status: "نشط",
          schedule: "$shift.name",
        },
      },
      { $limit: 5 },
    ]);

    // 6. الإجازات القادمة (في الأسبوع المقبل)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingLeaves = await Leave.find({
      status: "موافق عليها",
      startDate: { $gte: today, $lte: nextWeek },
    })
      .populate("employee", "fullName")
      .sort({ startDate: 1 })
      .limit(5);
    // 7. طلبات الغياب الأخيرة
    const recentAbsences = await Absence.find({
      status: { $in: ["معلقة", "موافق عليها"] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate("employee", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. الرواتب المستحقة
    const pendingSalaries = await Salary.find({
      status: "مسودة",
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    })
      .populate("employee", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    // 9. تحليلات الغياب
    const absenceTrend = await Absence.aggregate([
      {
        $match: {
          status: "موافق عليها",
          date: { $gte: new Date(today.getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // 10. توزيع الإجازات
    const leaveDistribution = await Leave.aggregate([
      {
        $match: {
          status: "موافق عليها",
          startDate: { $gte: new Date(today.getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // تنسيق البيانات للإرسال
    res.status(200).json({
      employeesCount,
      employeesChange,
      todayAbsences,
      absencesChange,
      approvedLeaves,
      leavesChange,
      monthlySalaries,
      salariesChange,
      activeEmployees,
      upcomingLeaves: upcomingLeaves.map((leave) => ({
        name: leave.employee?.fullName || "غير معروف", // التحقق هنا
        detail: `${leave.duration} يوم - ${leave.type}`,
        date: leave.startDate.toLocaleDateString("ar-IQ"),
        status: leave.status,
      })),
      recentAbsences: recentAbsences.map((absence) => ({
        name: absence.employee.fullName,
        detail: `${absence.type} - ${absence.duration} ساعة`,
        date: absence.date.toLocaleDateString("ar-IQ"),
        status: absence.status,
      })),
      pendingSalaries: pendingSalaries.map((salary) => ({
        name: salary.employee?.fullName,
        detail: `${salary.netSalary.toLocaleString("ar-IQ")} د.ع`,
        date: `${salary.month}/${salary.year}`,
        status: salary.status,
      })),
      absenceTrend: absenceTrend.map((item) => ({
        label: item.month,
        value: item.count,
      })),
      leaveDistribution: leaveDistribution.map((item) => ({
        label: item.type,
        value: item.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    next(errorHandler(500, "حدث خطأ أثناء جلب بيانات لوحة التحكم"));
  }
};
