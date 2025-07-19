import Employee from "./employee.models.js";
import { errorHandler } from "../../utils/error.js";
import jwt from "jsonwebtoken";
import User from "../auth/auth.models.js";

export const createEmployee = async (req, res, next) => {
  try {
    // التحقق من وجود المستخدم أولاً
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, "غير مصرح به - يلزم تسجيل الدخول"));
    }
    const employeeData = {
      ...req.body,
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

// src/modules/employee/employee.controller.js
export const loginEmployee = async (req, res, next) => {
  const { fullName, email } = req.body;
  try {
    const validEmployee = await Employee.findOne({ fullName });
    if (!validEmployee) {
      return next(errorHandler(404, "Employee not found"));
    }
    if (validEmployee.email !== email) {
      return next(errorHandler(404, "invalid Employee"));
    }

    // البحث عن مستخدم موجود أو إنشاء جديد
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: validEmployee.fullName,
        email: validEmployee.email,
        password: "defaultPassword",
        employee: validEmployee._id,
      });
      await user.save();
    } else {
      user.employee = validEmployee._id;
      await user.save();
    }

    // إنشاء التوكن مع معلومات المستخدم
    const token = jwt.sign(
      {
        id: user._id, // استخدام id المستخدم وليس الموظف
        isAdmin: user.isAdmin,
        isHR: user.isHR,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      })
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isHR: user.isHR,
        employee: user.employee,
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
    const employee = await Employee.findById(req.params.id)
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
