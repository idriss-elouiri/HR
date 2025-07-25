"use client";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaMoneyBillWave, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const repaymentMethods = [
  { value: "خصم مرة واحدة", label: "خصم مرة واحدة من الراتب" },
  { value: "تقسيط", label: "تقسيط على عدة أشهر" },
  { value: "نقدي", label: "سداد نقدي" },
];

const AdvanceRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // التصحيح: تعديل طريقة استخدام Yup.number().when()
  const validationSchema = Yup.object({
    amount: Yup.number()
      .required("المبلغ مطلوب")
      .min(1, "يجب أن يكون المبلغ أكبر من الصفر"),
    reason: Yup.string()
      .required("سبب الطلب مطلوب")
      .max(500, "الحد الأقصى 500 حرف"),
    repaymentMethod: Yup.string().required("طريقة السداد مطلوبة"),
    installments: Yup.number().when(
      "repaymentMethod",
      (repaymentMethod, schema) => {
        return repaymentMethod === "تقسيط"
          ? schema
              .required("عدد الأشهر مطلوب")
              .min(1, "الحد الأدنى شهر واحد")
              .max(12, "الحد الأقصى 12 شهر")
          : schema;
      }
    ),
  });

  const formik = useFormik({
    initialValues: {
      amount: "",
      reason: "",
      repaymentMethod: "خصم مرة واحدة",
      installments: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // التحقق من وجود الموظف
        if (!currentUser?.employee) {
          throw new Error("لا يوجد موظف مرتبط بحسابك");
        }

        const payload = {
          ...values,
          employee: currentUser.employee,
        };

        const response = await fetch(`${apiUrl}/api/advance-requests`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "حدث خطأ أثناء تقديم الطلب");
        }

        toast.success("تم تقديم طلب السلفة بنجاح! سيتم مراجعته من قبل المدير");
        formik.resetForm();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // إظهار/إخفاء حقل الأقساط بناءً على طريقة السداد
  useEffect(() => {
    if (formik.values.repaymentMethod !== "تقسيط") {
      formik.setFieldValue("installments", 1);
    }
  }, [formik.values.repaymentMethod]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-xl p-5 mb-6">
        <h2 className="text-2xl font-bold">طلب سلفة مالية</h2>
        <p className="opacity-90">املأ النموذج أدناه لتقديم طلب سلفة مالية</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              المبلغ المطلوب
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="أدخل المبلغ"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">د.ع</span>
            </div>
            {formik.touched.amount && formik.errors.amount && (
              <p className="mt-1 text-red-600">{formik.errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              طريقة السداد
            </label>
            <select
              name="repaymentMethod"
              value={formik.values.repaymentMethod}
              onChange={formik.handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {repaymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {formik.values.repaymentMethod === "تقسيط" && (
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                عدد الأشهر
              </label>
              <input
                type="number"
                name="installments"
                value={formik.values.installments}
                onChange={formik.handleChange}
                min="1"
                max="12"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {formik.touched.installments && formik.errors.installments && (
                <p className="mt-1 text-red-600">
                  {formik.errors.installments}
                </p>
              )}
              {formik.values.installments > 1 && (
                <p className="mt-2 text-green-600">
                  القسط الشهري:{" "}
                  {(formik.values.amount / formik.values.installments).toFixed(
                    2
                  )}{" "}
                  د.ع
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            سبب الطلب
          </label>
          <textarea
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="أدخل سبب طلب السلفة..."
          ></textarea>
          {formik.touched.reason && formik.errors.reason && (
            <p className="mt-1 text-red-600">{formik.errors.reason}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => formik.resetForm()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FaTimes className="inline-block ml-2" /> إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-lg hover:from-green-700 hover:to-teal-800 disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block mr-2">↻</span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <FaSave className="inline-block ml-2" /> تقديم الطلب
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvanceRequestForm;
