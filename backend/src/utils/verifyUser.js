// src/utils/verifyUser.js
import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.models.js";
import Employee from "../modules/employee/employee.models.js";
import { errorHandler } from "../utils/error.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    console.log(token)
    if (!token) return next(errorHandler(401, "غير مصرح به"));

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return next(errorHandler(403, "الرمز غير صالح"));

      // 1. البحث في مستخدمي النظام أولاً
      const systemUser = await User.findById(decoded.id);
      if (systemUser) {
        req.user = systemUser;
        return next();
      }

      // 2. إذا لم يوجد في النظام، ابحث في الموظفين
      const employeeUser = await Employee.findById(decoded.id);
      if (employeeUser) {
        req.user = {
          ...employeeUser.toObject(),
          isAdmin: false,
          isHR: employeeUser.isHR,
        };
        return next();
      }

      // 3. إذا لم يوجد في أي مكان
      return next(errorHandler(404, "المستخدم غير موجود"));
    });
  } catch (error) {
    next(error);
  }
};
