// components/AbsenceForm.js
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
    FaClock
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const absenceTypes = [
    { value: 'غياب كامل', label: 'غياب كامل' },
    { value: 'تأخير', label: 'تأخير' },
    { value: 'انصراف مبكر', label: 'انصراف مبكر' }
];

const statusOptions = [
    { value: 'معلقة', label: 'معلقة' },
    { value: 'موافق عليها', label: 'موافق عليها' },
    { value: 'مرفوضة', label: 'مرفوضة' },
    { value: 'ملغاة', label: 'ملغاة' }
];

const AbsenceForm = ({ absence, onSuccess, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const validationSchema = Yup.object({
        employee: Yup.string().required('اختيار الموظف مطلوب'),
        type: Yup.string().required('نوع الغياب مطلوب'),
        date: Yup.date().required('تاريخ الغياب مطلوب'),
        duration: Yup.number()
            .min(0.1, 'يجب أن تكون المدة 0.1 على الأقل')
            .max(24, 'لا يمكن أن تتجاوز المدة 24 ساعة')
            .when('type', {
                is: (type) => type !== 'غياب كامل',
                then: Yup.number().required('مدة الغياب مطلوبة')
            }),
        reason: Yup.string()
            .required('سبب الغياب مطلوب')
            .max(500, 'الحد الأقصى 500 حرف'),
        status: Yup.string().required('حالة الغياب مطلوبة'),
    });

    const formik = useFormik({
        initialValues: {
            employee: absence?.employee?._id || '',
            type: absence?.type || 'غياب كامل',
            date: absence?.date ? new Date(absence.date) : new Date(),
            duration: absence?.duration || 0,
            reason: absence?.reason || '',
            status: absence?.status || 'معلقة',
            notes: absence?.notes || ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const url = absence
                    ? `${apiUrl}/api/absences/${absence._id}`
                    : `${apiUrl}/api/absences`;

                const method = absence ? 'PUT' : 'POST';

                // إذا كان الغياب كاملاً، ضبط المدة على 8 ساعات
                const finalValues = {
                    ...values,
                    date: values.date.toISOString(),
                    duration: values.type === 'غياب كامل' ? 8 : values.duration
                };

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(finalValues),
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

    const inputClass = (touched, error) =>
        `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched && error ? 'border-red-500' : 'border-gray-300'
        }`;

    if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;

    return (
        <form onSubmit={formik.handleSubmit} className="p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
                {absence ? 'تعديل بيانات الغياب' : 'إضافة غياب جديد'}
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
                        disabled={!!absence}
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
                        نوع الغياب
                    </label>
                    <select
                        name="type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={inputClass(formik.touched.type, formik.errors.type)}
                    >
                        {absenceTypes.map(type => (
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
                        تاريخ الغياب
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={formik.values.date}
                            onChange={(date) => formik.setFieldValue('date', date)}
                            dateFormat="yyyy/MM/dd"
                            className={inputClass(formik.touched.date, formik.errors.date)}
                        />
                        <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                    {formik.touched.date && formik.errors.date && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <FaInfoCircle className="ml-1" /> {formik.errors.date}
                        </p>
                    )}
                </div>

                {formik.values.type !== 'غياب كامل' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            المدة (ساعات)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="duration"
                                value={formik.values.duration}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                min="0.1"
                                max="8"
                                step="0.1"
                                className={inputClass(formik.touched.duration, formik.errors.duration)}
                                placeholder="أدخل المدة..."
                            />
                            <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.duration && formik.errors.duration && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.duration}
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        حالة الغياب
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
                        سبب الغياب
                    </label>
                    <textarea
                        name="reason"
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows="3"
                        className={inputClass(formik.touched.reason, formik.errors.reason)}
                        placeholder="أدخل سبب الغياب..."
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
                            <FaSave className="ml-2" /> {absence ? 'تحديث' : 'حفظ'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AbsenceForm;