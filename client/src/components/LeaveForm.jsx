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
  FaSync
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { toast } from 'react-toastify';

const leaveTypes = [
  { value: 'سنوية', label: 'إجازة سنوية' },
  { value: 'مرضية', label: 'إجازة مرضية' },
  { value: 'أمومة', label: 'إجازة أمومة' },
  { value: 'بدون راتب', label: 'إجازة بدون راتب' },
  { value: 'طارئة', label: 'إجازة طارئة' },
  { value: 'أخرى', label: 'إجازة أخرى' }
];

const statusOptions = [
  { value: 'معلقة', label: 'معلقة' },
  { value: 'موافق عليها', label: 'موافق عليها' },
  { value: 'مرفوضة', label: 'مرفوضة' },
  { value: 'ملغاة', label: 'ملغاة' }
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
    `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched && error ? 'border-red-500' : 'border-gray-300'
    }`;

  if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <form onSubmit={formik.handleSubmit} className="p-6">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        {leave ? 'تعديل بيانات الإجازة' : 'إضافة إجازة جديدة'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الموظف
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع الإجازة
          </label>
          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass(formik.touched.type, formik.errors.type)}
          >
            {leaveTypes.map(type => (
              <option key={type.value} value={type.value}>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المدة (أيام)
          </label>
          <input
            type="number"
            name="duration"
            value={formik.values.duration}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            حالة الإجازة
          </label>
          <select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass(formik.touched.status, formik.errors.status)}
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظات
          </label>
          <textarea
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            rows="2"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل أي ملاحظات..."
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <FaTimes className="ml-2" /> إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          {isSubmitting ? (
            <>
              <FaSync className="animate-spin ml-2" /> جاري الحفظ...
            </>
          ) : (
            <>
              <FaSave className="ml-2" /> {leave ? 'تحديث' : 'حفظ'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default LeaveForm;   