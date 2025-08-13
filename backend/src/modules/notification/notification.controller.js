import Notification from "./notification.model.js";
import { errorHandler } from "../../utils/error.js";
import User from "../auth/auth.models.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeNotifications = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const query = {
      user: req.user.id,
      forEmployee: true,
    };

    // إضافة فلتر الإشعارات غير المقروءة
    if (unread === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadEmployeeNotifications = async (req, res, next) => {
  try {
    // البحث عن المستخدم المرتبط بالموظف
    const user = await User.findById(req.user.id);
    if (!user || !user.employee) {
      return next(errorHandler(404, "لم يتم العثور على بيانات الموظف"));
    }

    const count = await Notification.countDocuments({
      user: req.user.id,
      forEmployee: true,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(errorHandler(404, "الإشعار غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: "تم وضع جميع الإشعارات كمقروءة",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return next(errorHandler(404, "الإشعار غير موجود"));
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الإشعار",
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const query = {
      user: req.user.id,
      read: false,
    };

    if (req.query.forEmployee) {
      query.forEmployee = true;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};
