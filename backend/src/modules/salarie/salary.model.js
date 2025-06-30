import mongoose from "mongoose";

const allowanceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["سنوية", "مكافأة", "حافز", "أخرى"],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    description: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const deductionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["سلفة", "غرامة", "تأمينات", "ضريبة", "أخرى"],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    description: String,
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["معلقة", "مسددة", "ملغاة"],
        default: "معلقة",
    },
});

const socialInsuranceSchema = new mongoose.Schema({
    amount: {
        type: Number,
        min: 0,
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10,
    },
});

const salarySchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
            min: 2000,
        },
        baseSalary: {
            type: Number,
            required: true,
            min: 0,
        },
        allowances: [allowanceSchema],
        deductions: [deductionSchema],
        socialInsurance: socialInsuranceSchema,
        netSalary: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["مسودة", "معتمدة", "ملغاة", "مسددة"],
            default: "مسودة",
        },
        paymentDate: Date,
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

// Middleware لحساب الراتب الصافي قبل الحفظ
salarySchema.pre("save", function (next) {
    const totalAllowances = this.allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalDeductions = this.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    const insuranceDeduction = this.socialInsurance?.amount || 0;

    this.netSalary = this.baseSalary + totalAllowances - totalDeductions - insuranceDeduction;
    next();
});

// التحقق من صحة البيانات قبل الحفظ
salarySchema.pre("validate", function (next) {
    if (this.month < 1 || this.month > 12) {
        this.invalidate("month", "الشهر يجب أن يكون بين 1 و 12");
    }
    if (this.year < 2000) {
        this.invalidate("year", "السنة يجب أن تكون أكبر من 2000");
    }
    if (this.baseSalary < 0) {
        this.invalidate("baseSalary", "الراتب الأساسي يجب أن يكون رقم موجب");
    }
    next();
});

const Salary = mongoose.model("Salary", salarySchema);

export default Salary