import { errorHandler } from "../../utils/error.js";
import User from "../auth/auth.models.js";
import Employee from "../employee/employee.models.js";
import Notification from "../notification/notification.model.js";
import AdvanceRequest from "./advanceRequest.model.js";
export const createAdvanceRequest = async (req, res, next) => {
  try {
    const { employee: employeeId, amount, reason } = req.body;

    // التحقق من صحة البيانات
    if (!employeeId || !amount || !reason) {
      return next(errorHandler(400, "جميع الحقول مطلوبة"));
    }

    // التحقق من وجود الموظف
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    const advanceRequest = new AdvanceRequest({
      ...req.body,
      createdBy: req.user.id,
      status: req.body.status || "معلقة",
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
        link: `/advance-requests/${advanceRequest._id}`,
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

export const updateAdvanceRequestStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const advanceRequest = await AdvanceRequest.findById(req.params.id)
      .populate("employee", "fullName")
      .populate("createdBy", "name");

    if (!advanceRequest) {
      return next(errorHandler(404, "طلب السلفة غير موجود"));
    }

    // فقط المديرين وموظفي HR يمكنهم تغيير الحالة
    if (!req.user.isAdmin && !req.user.isHR) {
      return next(errorHandler(403, "غير مسموح لك بتغيير حالة الطلب"));
    }

    const oldStatus = advanceRequest.status;
    advanceRequest.status = status;
    advanceRequest.approvedBy = req.user.id;
    advanceRequest.dateApproved = new Date();
    advanceRequest.notes = notes || advanceRequest.notes;

    await advanceRequest.save();

    // إرسال إشعار للموظف فقط إذا تغيرت الحالة
    if (oldStatus !== status) {
      const userNotification = new Notification({
        user: advanceRequest.createdBy,
        title: "تحديث حالة طلب السلفة",
        message: `تم ${status} طلب السلفة الخاص بك بمبلغ ${advanceRequest.amount} د.ع`,
        link: `/employee/advance-requests/${advanceRequest._id}`,
        type: "advance",
        metadata: {
          advanceRequestId: advanceRequest._id,
          status: status,
        },
      });

      await userNotification.save();

      // إرسال إشعار للمدير أيضًا
      const adminNotification = new Notification({
        user: req.user.id,
        title: "تم تحديث حالة طلب سلفة",
        message: `لقد قمت بتحديث حالة طلب السلفة للموظف ${advanceRequest.employee.fullName} إلى ${status}`,
        link: `/advance-requests/${advanceRequest._id}`,
        type: "advance",
        metadata: {
          advanceRequestId: advanceRequest._id,
          status: status,
        },
      });

      await adminNotification.save();
    }

    res.status(200).json({
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

export const markAdvanceAsPaid = async (req, res, next) => {
  try {
    const advanceRequest = await AdvanceRequest.findById(req.params.id);
    if (!advanceRequest) {
      return next(errorHandler(404, "طلب السلفة غير موجود"));
    }

    if (advanceRequest.status !== "موافق عليها") {
      return next(errorHandler(400, "يجب الموافقة على الطلب أولاً"));
    }

    advanceRequest.status = "مسددة";
    advanceRequest.isPaid = true;
    advanceRequest.dateRepaid = new Date();

    await advanceRequest.save();

    res.status(200).json({
      success: true,
      data: advanceRequest,
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

    // فقط منشئ الطلب أو المدير/HR يمكنهم الحذف
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
