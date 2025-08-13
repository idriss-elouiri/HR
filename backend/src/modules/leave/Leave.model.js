import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["سنوية", "مرضية", "أمومة", "بدون راتب", "طارئة", "زمنية", "أخرى"], // إضافة النوع الجديد
    },
    startDate: {
      type: Date,
      required: function () {
        return this.type !== "زمنية";
      }, // ليس مطلوبًا للإجازة الزمنية
    },
    endDate: {
      type: Date,
      required: function () {
        return this.type !== "زمنية";
      }, // ليس مطلوبًا للإجازة الزمنية
    },
    startTime: {
      type: String,
      required: function () {
        return this.type === "زمنية";
      }, // مطلوب للإجازة الزمنية
    },
    endTime: {
      type: String, // تخزين الوقت كسلسلة (مثال: "14:45")
      required: function () {
        return this.type === "زمنية";
      }, // مطلوب للإجازة الزمنية
    },
    duration: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["معلقة", "موافق عليها", "مرفوضة", "ملغاة"],
      default: "معلقة",
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
