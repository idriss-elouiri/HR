// routes/notification.route.js
import express from "express";
import { verifyToken } from "../../utils/verifyUser.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/mark-all-read", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);

export default router;
