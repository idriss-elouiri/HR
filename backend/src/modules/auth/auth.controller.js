// auth.controller.js
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "./auth.models.js";
import { errorHandler } from "../../utils/error.js";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "البريد الإلكتروني مسجل مسبقاً"));
    }

    const hashedPassword = bcryptjs.hashSync(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // إنشاء توكن بدون كلمة المرور في الرد
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = newUser._doc;

    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None", // حتى يُسمح له بالعمل بين دومينات مختلفة
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      })
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "المستخدم غير موجود"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "بيانات الدخول غير صحيحة"));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token").status(200).json("تم تسجيل الخروج بنجاح");
};
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return next(errorHandler(403, "غير مصرح لك بتحديث هذا المستخدم"));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true }
    ).select("-password");

    // إرجاع المسار الكامل للصورة
    const userWithFullPath = {
      ...updatedUser._doc,
      profilePicture: updatedUser.profilePicture
        ? updatedUser.profilePicture // لا تُضف BASE_URL هنا
        : null,
    };

    res.status(200).json(userWithFullPath);
  } catch (error) {
    next(error);
  }
};

// الحصول على بيانات مستخدم
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return next(errorHandler(404, "المستخدم غير موجود"));

    // أضف BASE_URL فقط عند الاستجابة
    const fullProfilePicture = user.profilePicture
      ? `${process.env.BASE_URL || "http://localhost:3005"}${
          user.profilePicture
        }`
      : null;

    res.status(200).json({
      ...user._doc,
      profilePicture: fullProfilePicture,
    });
  } catch (error) {
    next(error);
  }
};
