// models/Absence.model.js
import mongoose from "mongoose";

const absenceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      required: true,
      enum: ["غياب كامل", "تأخير", "انصراف مبكر"]
    },
    duration: {
      type: Number, // بالساعات
      min: 0.1,
      max: 24
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["معلقة", "موافق عليها", "مرفوضة", "ملغاة"],
      default: "معلقة"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    notes: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Absence = mongoose.model("Absence", absenceSchema);

export default Absence;