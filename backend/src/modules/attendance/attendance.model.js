import mongoose from "mongoose";
import Employee from "../employee/employee.models.js";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "يجب تحديد الموظف"],
      validate: {
        validator: async function (value) {
          const employeeExists = await Employee.exists({ _id: value });
          return employeeExists;
        },
        message: "الموظف غير موجود في النظام",
      },
    },

    date: {
      type: Date,
      required: [true, "يجب تحديد تاريخ الحضور"],
      default: Date.now,
      index: true, // فهرسة للحصول على أداء أفضل في الاستعلامات
    },

    checkIn: {
      type: Date,
      required: [true, "يجب تحديد وقت الحضور"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "وقت الحضور لا يمكن أن يكون في المستقبل",
      },
    },

    checkOut: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value >= this.checkIn && value <= new Date();
        },
        message: "وقت الانصراف يجب أن يكون بعد وقت الحضور وقبل الوقت الحالي",
      },
    },

    workingHours: {
      type: Number,
      min: [0, "ساعات العمل لا يمكن أن تكون سلبية"],
      set: function (value) {
        return parseFloat(value.toFixed(2)); // تخزين بقيمة عشرية مع رقمين
      },
    },

    status: {
      type: String,
      enum: {
        values: ["حاضر", "متأخر", "غياب", "إجازة", "غياب جزئي"],
        message: "حالة الحضور غير صالحة",
      },
      default: "حاضر",
    },

    delayMinutes: {
      type: Number,
      min: [0, "دقائق التأخير لا يمكن أن تكون سلبية"],
    },

    deviceId: {
      type: String,
      required: [true, "يجب تحديد الجهاز المستخدم للتسجيل"],
      enum: ["web-interface", "zk-device-1", "zk-device-2"], // أمثلة لأجهزة البصمة
    },

    notes: {
      type: String,
      maxlength: [500, "الملاحظات لا يمكن أن تتجاوز 500 حرف"],
    },

    isManual: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware قبل الحفظ لحساب ساعات العمل والتأخير تلقائياً
attendanceSchema.pre("save", async function (next) {
  if (this.isModified("checkOut") && this.checkOut) {
    // حساب ساعات العمل (بالساعات)
    this.workingHours = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
  }

  // حساب دقائق التأخير إذا كان هناك شفت عمل
  if (this.isModified("checkIn")) {
    const employee = await Employee.findById(this.employee).populate("shift");
    if (employee?.shift) {
      const shiftStart = new Date(this.checkIn);
      shiftStart.setHours(
        ...employee.shift.startTime.split(":").map(Number),
        0,
        0
      );

      this.delayMinutes = Math.max(
        0,
        (this.checkIn - shiftStart) / (1000 * 60)
      );

      if (this.delayMinutes > 15) {
        this.status = "متأخر";
      }
    }
  }

  next();
});

// استعلام مساعد للبحث عن سجلات الحضور اليومية
attendanceSchema.statics.findTodayAttendance = function (employeeId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findOne({
    employee: employeeId,
    date: { $gte: today },
  });
};

// علاقة افتراضية مع نموذج الموظف
attendanceSchema.virtual("employeeDetails", {
  ref: "Employee",
  localField: "employee",
  foreignField: "_id",
  justOne: true,
});

// فهارس لتحسين الأداء
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true }); // منع التسجيلات المكررة
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ deviceId: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
