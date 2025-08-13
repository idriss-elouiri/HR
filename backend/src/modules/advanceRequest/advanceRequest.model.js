import mongoose from "mongoose";

const advanceRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["معلقة", "موافق عليها", "مرفوضة", "مسددة"],
      default: "معلقة",
    },
    repaymentMethod: {
      type: String,
      enum: ["خصم مرة واحدة", "تقسيط", "نقدي"],
      default: "خصم مرة واحدة",
    },
    installments: {
      type: Number,
      min: 1,
      max: 12,
      default: 1,
    },
    deductionPerMonth: Number,
    dateRequested: {
      type: Date,
      default: Date.now,
    },
    dateApproved: Date,
    dateRepaid: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
    isPaid: {
      type: Boolean,
      default: false,
    },
    includedInSalary: {
      type: Boolean,
      default: false,
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

advanceRequestSchema.pre("save", function (next) {
  if (this.repaymentMethod === "تقسيط" && this.installments > 1) {
    this.deductionPerMonth = this.amount / this.installments;
  } else {
    this.deductionPerMonth = this.amount;
  }
  next();
});

const AdvanceRequest = mongoose.model("AdvanceRequest", advanceRequestSchema);

export default AdvanceRequest;
