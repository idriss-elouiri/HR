import Employee from "./employee.models.js";
import { errorHandler } from "../../utils/error.js";
import jwt from "jsonwebtoken";
import User from "../auth/auth.models.js";
import crypto from "crypto";

export const createEmployee = async (req, res, next) => {
  try {
    // التحقق من وجود المستخدم أولاً
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, "غير مصرح به - يلزم تسجيل الدخول"));
    }
    const employeeData = {
      ...req.body,
      isHR: req.body.isHR || false,
      createdBy: req.user.id,
    };
    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(400, `هذا ${field} مسجل مسبقاً`));
    }
    next(error);
  }
};
export const loginEmployee = async (req, res, next) => {
  const { fullName, email } = req.body;

  try {
    // البحث باستخدام تعبير منتظم لتجاهل حالة الأحرف
    const validEmployee = await Employee.findOne({
      fullName: { $regex: new RegExp(`^${fullName}$`, "i") },
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!validEmployee) {
      return next(errorHandler(404, "بيانات الموظف غير صحيحة"));
    }

    // البحث عن مستخدم مرتبط بهذا الموظف
    let user = await User.findOne({ employee: validEmployee._id });

    // إنشاء مستخدم جديد إذا لم يوجد
    if (!user) {
      user = new User({
        name: validEmployee.fullName,
        email: validEmployee.email,
        password: crypto.randomBytes(16).toString("hex"),
        employee: validEmployee._id,
        isHR: validEmployee.isHR, // استخدام قيمة isHR من الموظف
      });
      await user.save();
    }

    // إنشاء التوكن
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        isHR: user.isHR,
        employeeId: validEmployee._id, // إضافة معرّف الموظف في التوكن
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال الاستجابة مع التوكن
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isHR: user.isHR,
        employee: validEmployee,
      });
  } catch (error) {
    next(error);
  }
};
export const loginHrEmployee = async (req, res, next) => {
  const { fullName, email } = req.body;
console.log(fullName, email)
  try {
    // البحث باستخدام تعبير منتظم لتجاهل حالة الأحرف
    const validEmployee = await Employee.findOne({
      fullName: { $regex: new RegExp(`^${fullName}$`, "i") },
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isHR: true, // تأكد أن الموظف هو موظف HR
    });

    if (!validEmployee) {
      return next(
        errorHandler(404, "بيانات الموظف غير صحيحة أو ليس لديك صلاحية الدخول")
      );
    }

    // البحث عن مستخدم مرتبط بهذا الموظف
    let user = await User.findOne({ employee: validEmployee._id });

    // إنشاء مستخدم جديد إذا لم يوجد
    if (!user) {
      user = new User({
        name: validEmployee.fullName,
        email: validEmployee.email,
        password: crypto.randomBytes(16).toString("hex"),
        employee: validEmployee._id, // ربط الموظف بالمستخدم
        isHR: true,
      });
      await user.save();
    }

    // إنشاء التوكن
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        isHR: user.isHR,
        employeeId: validEmployee._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال الاستجابة مع التوكن
    res
      .status(200)
      .cookie("access_token", token, {
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isHR: user.isHR,
        employee: validEmployee,
      });
  } catch (error) {
    next(error);
  }
};
export const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { nationalId: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.employmentStatus = status;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .select("-__v"),
      Employee.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getEmployee = async (req, res, next) => {
  try {
    // استخدام employeeId بدلاً من _id
    const employee = await Employee.findOne({ employeeId: req.params.id })
      .select("-__v")
      .populate("createdBy", "name email");

    if (!employee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};
export const updateEmployee = async (req, res, next) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedEmployee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(400, `هذا ${field} مسجل مسبقاً`));
    }
    next(error);
  }
};

// controllers/employee.controller.js
export const updateEmployeeShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shift } = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { shift },
      { new: true }
    ).populate("shift department");

    if (!updatedEmployee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الموظف بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeByEmployeeId = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      employeeId: req.params.employeeId,
    }).select("-__v");

    if (!employee) {
      return next(errorHandler(404, "الموظف غير موجود"));
    }

    // إرسال رد واحد فقط
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error); // استخدام next لنقل الخطأ
  }
};
