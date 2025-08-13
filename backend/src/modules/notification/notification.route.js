import express from "express";
import { verifyToken } from "../../utils/verifyUser.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getEmployeeNotifications,
  getUnreadEmployeeNotifications,
  getUnreadNotifications, // إضافة المسار الجديد
} from "./notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/employee", verifyToken, getEmployeeNotifications);
router.get("/unread", verifyToken, getUnreadNotifications); // مسار جديد
router.put("/:id/read", verifyToken, markAsRead);
router.put("/mark-all-read", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.get("/employee/unread", verifyToken, getUnreadEmployeeNotifications);
router.put("/:id/action", verifyToken, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { actionTaken: true },
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
});
export default router;
