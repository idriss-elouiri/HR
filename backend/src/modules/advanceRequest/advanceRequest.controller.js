import { errorHandler } from "../../utils/error.js";
import User from "../auth/auth.models.js";
import Employee from "../employee/employee.models.js";
import Notification from "../notification/notification.model.js";
import AdvanceRequest from "./advanceRequest.model.js";

export const createAdvanceRequest = async (req, res, next) => {
  try {
    const { employee: employeeId, amount, reason } = req.body;

    if (!employeeId || !amount || !reason) {
      return next(errorHandler(400, "جميع الحقول مطلوبة"));
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    const advanceRequest = new AdvanceRequest({
      ...req.body,
      createdBy: req.user.id,
      status: "معلقة", // الحالة الافتراضية
    });

    await advanceRequest.save();

    // إرسال إشعار للمديرين وموظفي HR
    if (!req.user.isAdmin && !req.user.isHR) {
      const adminsAndHR = await User.find({
        $or: [{ isAdmin: true }, { isHR: true }],
      });

      const notifications = adminsAndHR.map((user) => ({
        user: user._id,
        title: "طلب سلفة جديد",
        message: `الموظف ${employee.fullName} قدم طلب سلفة بمبلغ ${amount} د.ع`,
        link: `/salaries`, // تغيير الرابط إلى صفحة الرواتب
        type: "advance",
        metadata: {
          advanceRequestId: advanceRequest._id,
          employeeId: employee._id,
        },
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      data: advanceRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdvanceRequests = async (req, res, next) => {
  try {
    const { employeeId, status } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;

    // للموظفين العاديين: يمكنهم رؤية طلباتهم فقط
    if (!req.user.isAdmin && !req.user.isHR) {
      query.employee = req.user.employee;
    }

    const advanceRequests = await AdvanceRequest.find(query)
      .populate("employee", "fullName employeeId")
      .populate("createdBy", "name")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: advanceRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdvanceRequest = async (req, res, next) => {
  try {
    const updatedRequest = await AdvanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRequest) {
      return next(errorHandler(404, "طلب السلفة غير موجود"));
    }

    // إرسال إشعار للموظف إذا تغيرت الحالة
    if (["موافق عليها", "مرفوضة"].includes(updatedRequest.status)) {
      const user = await User.findOne({ employee: updatedRequest.employee });

      if (user) {
        await Notification.create({
          user: user._id,
          title: `طلب سلفة ${updatedRequest.status}`,
          message: `تم ${updatedRequest.status} طلب سلفتك بمبلغ ${updatedRequest.amount} د.ع`,
          type: "advance",
          forEmployee: true,
          metadata: {
            advanceId: updatedRequest._id,
            status: updatedRequest.status,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvanceRequest = async (req, res, next) => {
  try {
    const advanceRequest = await AdvanceRequest.findById(req.params.id);
    if (!advanceRequest) {
      return next(errorHandler(404, "طلب السلفة غير موجود"));
    }

    if (
      advanceRequest.createdBy.toString() !== req.user.id &&
      !req.user.isAdmin &&
      !req.user.isHR
    ) {
      return next(errorHandler(403, "غير مسموح لك بحذف هذا الطلب"));
    }

    await advanceRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: "تم حذف طلب السلفة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
