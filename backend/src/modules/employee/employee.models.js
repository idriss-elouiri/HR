import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "رقم الموظف مطلوب"],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "الاسم الكامل مطلوب"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["ذكر", "أنثى"],
      required: [true, "الجنس مطلوب"],
    },
    maritalStatus: {
      type: String,
      enum: ["أعزب", "متزوج", "مطلق", "أرمل"],
      required: [true, "الحالة الاجتماعية مطلوبة"],
    },
    department: {
      type: String,
      required: [true, "القسم مطلوب"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "المسمى الوظيفي مطلوب"],
      trim: true,
    },
    contractType: {
      type: String,
      enum: ["دوام كامل", "دوام جزئي", "مؤقت"],
      required: [true, "نوع العقد مطلوب"],
    },
    socialSecurityNumber: {
      type: String,
      required: [true, "رقم الضمان الاجتماعي مطلوب"],
      unique: true,
      trim: true,
    },
    nationalId: {
      type: String,
      required: [true, "رقم الهوية مطلوب"],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, "العنوان مطلوب"],
      trim: true,
    },
    hireDate: {
      type: Date,
      required: [true, "تاريخ التوظيف مطلوب"],
    },
    employmentStatus: {
      type: String,
      enum: ["نشط", "موقوف", "مفصول"],
      default: "نشط",
    },
    salary: {
      type: Number,
      required: [true, "الراتب مطلوب"],
      min: [0, "الراتب يجب أن يكون رقم موجب"],
    },
    bankAccount: {
      type: String,
      required: [true, "رقم الحساب البنكي مطلوب"],
      trim: true,
    },
    emergencyContact: {
      type: String,
      required: [true, "جهة الاتصال في حالات الطوارئ مطلوبة"],
      trim: true,
    },
    qualifications: {
      type: String,
      required: [true, "المؤهلات مطلوبة"],
      trim: true,
    },
    officialDocuments: {
      type: [String],
      default: [],
    },
    employmentDuration: {
      type: Number, // عدد السنوات
      default: 0,
    },
    familyMembers: {
      type: Number,
      default: 0,
    },
    rank: {
      type: String,
      trim: true,
    },
    lastSalaryIncrease: {
      date: Date,
      amount: Number,
    },
    appreciationLetters: {
      type: Boolean,
      default: false,
    },
    penalties: [
      {
        date: Date,
        description: String,
      },
    ],
    leaveSettings: {
      سنوية: { type: Number, default: 21 },
      مرضية: { type: Number, default: 30 },
      أمومة: { type: Number, default: 60 },
      بدون_راتب: { type: Number, default: 365 },
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
    fingerprintId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
employeeSchema.index({
  fullName: "text",
  employeeId: "text",
  nationalId: "text",
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
