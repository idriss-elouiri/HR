// src/components/EmployeeLeaveRequest.js
"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaClock,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const leaveTypes = [
  { value: "سنوية", label: "إجازة سنوية" },
  { value: "مرضية", label: "إجازة مرضية" },
  { value: "أمومة", label: "إجازة أمومة" },
  { value: "بدون راتب", label: "إجازة بدون راتب" },
  { value: "طارئة", label: "إجازة طارئة" },
  { value: "أخرى", label: "إجازة أخرى" },
];

const EmployeeLeaveRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const validationSchema = Yup.object({
    type: Yup.string().required("نوع الإجازة مطلوب"),
    startDate: Yup.date().required("تاريخ البداية مطلوب"),
    endDate: Yup.date()
      .required("تاريخ النهاية مطلوب")
      .min(Yup.ref("startDate"), "يجب أن يكون تاريخ النهاية بعد تاريخ البداية"),
    reason: Yup.string()
      .required("سبب الإجازة مطلوب")
      .max(500, "الحد الأقصى 500 حرف"),
  });

  const formik = useFormik({
    initialValues: {
      type: "سنوية",
      startDate: new Date(),
      endDate: new Date(),
      duration: 1,
      reason: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // التحقق من وجود الموظف
        if (!currentUser?._id) {
          throw new Error("لا يوجد موظف مرتبط بحسابك");
        }

        const payload = {
          ...values,
          employee: currentUser.employee, // استخدام _id مباشرةً
          status: "معلقة",
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        };

        const response = await fetch(`${apiUrl}/api/leaves`, {
          method: "POST",
          credentials: "include", // مهم
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "حدث خطأ أثناء تقديم الطلب");
        }

        toast.success("تم تقديم طلب الإجازة بنجاح! سيتم مراجعته من قبل المدير");
        formik.resetForm();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // حساب مدة الإجازة تلقائياً
  const calculateDuration = () => {
    if (formik.values.startDate && formik.values.endDate) {
      const diffTime = Math.abs(
        formik.values.endDate - formik.values.startDate
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      formik.setFieldValue("duration", diffDays);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-5 mb-6">
        <h2 className="text-2xl font-bold">تقديم طلب إجازة</h2>
        <p className="opacity-90">املأ النموذج أدناه لتقديم طلب إجازة جديد</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              نوع الإجازة
            </label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              المدة (أيام)
            </label>
            <input
              type="number"
              name="duration"
              value={formik.values.duration}
              readOnly
              className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50 text-blue-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              تاريخ البداية
            </label>
            <div className="relative">
              <DatePicker
                selected={formik.values.startDate}
                onChange={(date) => {
                  formik.setFieldValue("startDate", date);
                  calculateDuration();
                }}
                dateFormat="yyyy/MM/dd"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            {formik.touched.startDate && formik.errors.startDate && (
              <p className="mt-1 text-red-600">{formik.errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              تاريخ النهاية
            </label>
            <div className="relative">
              <DatePicker
                selected={formik.values.endDate}
                onChange={(date) => {
                  formik.setFieldValue("endDate", date);
                  calculateDuration();
                }}
                dateFormat="yyyy/MM/dd"
                minDate={formik.values.startDate}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            {formik.touched.endDate && formik.errors.endDate && (
              <p className="mt-1 text-red-600">{formik.errors.endDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            سبب الإجازة
          </label>
          <textarea
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل سبب الإجازة..."
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
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-75"
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

export default EmployeeLeaveRequest;
