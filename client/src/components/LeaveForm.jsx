// src/components/LeaveForm.js
'use client';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaUser,
  FaInfoCircle,
  FaSync,
  FaBriefcase,
  FaFileMedical,
  FaBaby,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const leaveTypes = [
  { value: 'سنوية', label: 'إجازة سنوية', icon: <FaBriefcase className="text-blue-500" /> },
  { value: 'مرضية', label: 'إجازة مرضية', icon: <FaFileMedical className="text-red-500" /> },
  { value: 'أمومة', label: 'إجازة أمومة', icon: <FaBaby className="text-pink-500" /> },
  { value: 'بدون راتب', label: 'إجازة بدون راتب', icon: <FaExclamationTriangle className="text-orange-500" /> },
  { value: 'طارئة', label: 'إجازة طارئة', icon: <FaClock className="text-yellow-500" /> },
  { value: 'أخرى', label: 'إجازة أخرى', icon: <FaInfoCircle className="text-purple-500" /> }
];

const statusOptions = [
  { value: 'معلقة', label: 'معلقة', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'موافق عليها', label: 'موافق عليها', color: 'bg-green-100 text-green-800' },
  { value: 'مرفوضة', label: 'مرفوضة', color: 'bg-red-100 text-red-800' },
  { value: 'ملغاة', label: 'ملغاة', color: 'bg-gray-100 text-gray-800' }
];

const LeaveForm = ({ leave, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const validationSchema = Yup.object({
    employee: Yup.string().required('اختيار الموظف مطلوب'),
    type: Yup.string().required('نوع الإجازة مطلوب'),
    startDate: Yup.date().required('تاريخ البداية مطلوب'),
    endDate: Yup.date()
      .required('تاريخ النهاية مطلوب')
      .min(Yup.ref('startDate'), 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية'),
    reason: Yup.string()
      .required('سبب الإجازة مطلوب')
      .max(500, 'الحد الأقصى 500 حرف'),
    status: Yup.string().required('حالة الإجازة مطلوبة'),
  });

  const formik = useFormik({
    initialValues: {
      employee: leave?.employee?._id || '',
      type: leave?.type || 'سنوية',
      startDate: leave?.startDate ? new Date(leave.startDate) : new Date(),
      endDate: leave?.endDate ? new Date(leave.endDate) : new Date(),
      duration: leave?.duration || 0,
      reason: leave?.reason || '',
      status: leave?.status || 'معلقة',
      notes: leave?.notes || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const url = leave
          ? `${apiUrl}/api/leaves/${leave._id}`
          : `${apiUrl}/api/leaves`;

        const method = leave ? 'PUT' : 'POST';

        // Send employee ID directly, not as object
        const payload = {
          ...values,
          employee: values.employee, // Already the ID string
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString()
        };

        // Remove duration from payload if updating
        if (leave) delete payload.duration;

        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'حدث خطأ أثناء الحفظ');
        }

        onSuccess();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/employees`);
        const data = await response.json();
        setEmployees(data.data || []);
      } catch (error) {
        toast.error('فشل في جلب بيانات الموظفين');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // حساب المدة تلقائياً عند تغيير التواريخ
  useEffect(() => {
    if (formik.values.startDate && formik.values.endDate) {
      const diffTime = Math.abs(formik.values.endDate - formik.values.startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      formik.setFieldValue('duration', diffDays);
    }
  }, [formik.values.startDate, formik.values.endDate]);

  const inputClass = (touched, error) =>
    `w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched && error
      ? 'border-red-500 bg-red-50'
      : 'border-gray-300 hover:border-blue-300'
    }`;

  const sectionClass = "bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300";
  const sectionHeaderClass = "text-lg font-semibold text-blue-700 flex items-center pb-2 border-b border-blue-100";

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-blue-800 font-medium">جاري تحميل البيانات...</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={formik.handleSubmit} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 mb-8 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            {leave ? 'تعديل بيانات الإجازة' : 'إضافة إجازة جديدة'}
          </h1>
          <p className="text-center text-blue-100 mt-2">
            نظام متكامل لإدارة إجازات الموظفين بدقة واحترافية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* المعلومات الأساسية */}
          <div className={sectionClass}>
            <h3 className={sectionHeaderClass}>
              <FaUser className="ml-2 text-blue-500" /> المعلومات الأساسية
            </h3>

            <div className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaUser className="ml-2 text-blue-500" /> الموظف
                </label>
                <select
                  name="employee"
                  value={formik.values.employee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass(formik.touched.employee, formik.errors.employee)}
                  disabled={!!leave}
                >
                  <option value="">اختر الموظف</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} - {emp.employeeId}
                    </option>
                  ))}
                </select>
                {formik.touched.employee && formik.errors.employee && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaInfoCircle className="ml-1" /> {formik.errors.employee}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaInfoCircle className="ml-2 text-purple-500" /> نوع الإجازة
                </label>
                <select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass(formik.touched.type, formik.errors.type)}
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value} className="flex items-center">
                      {type.label}
                    </option>
                  ))}
                </select>
                {formik.touched.type && formik.errors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaInfoCircle className="ml-1" /> {formik.errors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaCalendarAlt className="ml-2 text-green-500" /> حالة الإجازة
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass(formik.touched.status, formik.errors.status)}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value} className={status.color}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {formik.touched.status && formik.errors.status && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaInfoCircle className="ml-1" /> {formik.errors.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* تفاصيل الإجازة */}
          <div className={sectionClass}>
            <h3 className={sectionHeaderClass}>
              <FaCalendarAlt className="ml-2 text-blue-500" /> تفاصيل الإجازة
            </h3>

            <div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formik.values.startDate}
                      onChange={(date) => formik.setFieldValue('startDate', date)}
                      dateFormat="yyyy/MM/dd"
                      className={inputClass(formik.touched.startDate, formik.errors.startDate)}
                    />
                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                  {formik.touched.startDate && formik.errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FaInfoCircle className="ml-1" /> {formik.errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ النهاية
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formik.values.endDate}
                      onChange={(date) => formik.setFieldValue('endDate', date)}
                      dateFormat="yyyy/MM/dd"
                      className={inputClass(formik.touched.endDate, formik.errors.endDate)}
                      minDate={formik.values.startDate}
                    />
                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                  {formik.touched.endDate && formik.errors.endDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FaInfoCircle className="ml-1" /> {formik.errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة (أيام)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="duration"
                    value={formik.values.duration}
                    readOnly
                    className="w-full p-3 border border-blue-300 rounded-xl bg-blue-50 text-blue-700 font-bold"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* السبب والملاحظات */}
        <div className={sectionClass + " mt-8"}>
          <h3 className={sectionHeaderClass}>
            <FaInfoCircle className="ml-2 text-blue-500" /> معلومات إضافية
          </h3>

          <div className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب الإجازة
              </label>
              <textarea
                name="reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows="3"
                className={inputClass(formik.touched.reason, formik.errors.reason)}
                placeholder="أدخل سبب الإجازة..."
              ></textarea>
              {formik.touched.reason && formik.errors.reason && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaInfoCircle className="ml-1" /> {formik.errors.reason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="أدخل أي ملاحظات..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FaTimes className="ml-2" /> إلغاء
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <FaSave className="ml-2" /> {leave ? 'تحديث' : 'حفظ'}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
};

export default LeaveForm;