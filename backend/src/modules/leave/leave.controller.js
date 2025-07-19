// controllers/leave.controller.js
import Leave from "../leave/Leave.model.js";
import Employee from "../employee/employee.models.js";
import { errorHandler } from "../../utils/error.js";

export const createLeave = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;

    // إذا كان المستخدم موظف عادي، نستخدم معرف الموظف المرتبط بحسابه
    if (!req.user.isAdmin && !req.user.isHR && req.user.employee) {
      employeeId = req.user.employee;
    }

    // التحقق من وجود الموظف
    const employee = await Employee.findById(employeeId);
    if (!employee) return next(errorHandler(404, "الموظف غير موجود"));

    // حساب مدة الإجازة
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // إنشاء طلب الإجازة
    const leave = await Leave.create({
      ...req.body,
      employee: employeeId,
      duration: diffDays,
      createdBy: req.user.id,
      // الموظفين العاديين لا يمكنهم تغيير حالة الطلب
      status: req.user.isAdmin || req.user.isHR ? req.body.status : "معلقة",
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(400, `هذا ${field} مسجل مسبقاً`));
    }
    next(error);
  }
};

export const getLeaves = async (req, res, next) => {
  try {
    const { employeeId, type, status, month, year } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (type) query.type = type;
    if (status) query.status = status;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const leaves = await Leave.find(query)
      .populate("employee", "fullName employeeId")
      .populate("approvedBy", "name")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};
export const updateLeave = async (req, res, next) => {
  try {
    const { startDate, endDate, ...otherData } = req.body;

    // Calculate new duration if dates changed
    let updateData = { ...otherData };
    if (startDate && endDate) {
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      updateData.duration = diffDays;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      return next(errorHandler(404, "طلب الإجازة غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        approvedBy: req.user.id,
        approvedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedLeave) {
      return next(errorHandler(404, "طلب الإجازة غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveSummary = async (req, res, next) => {
  try {
    const { employeeId, year } = req.params;

    const summary = await Leave.aggregate([
      {
        $match: {
          employee: mongoose.Types.ObjectId(employeeId),
          status: "موافق عليها",
          $expr: {
            $eq: [{ $year: "$startDate" }, parseInt(year)],
          },
        },
      },
      {
        $group: {
          _id: "$type",
          totalDays: { $sum: "$duration" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return next(errorHandler(404, "طلب الإجازة غير موجود"));
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الإجازة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
