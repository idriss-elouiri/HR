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
import dynamic from 'next/dynamic';

const DatePicker = dynamic(
    () => import('react-datepicker').then(mod => mod.default),
    {
        ssr: false,
        loading: () => <div className="w-full p-3 border border-gray-300 rounded-lg">جار التحميل...</div>
    }
);
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
    const [isDatePickerLoaded, setIsDatePickerLoaded] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fix 2: Improved validation for duration
    const validationSchema = Yup.object({
        employee: Yup.string().required('اختيار الموظف مطلوب'),
        type: Yup.string().required('نوع الغياب مطلوب'),
        date: Yup.date().required('تاريخ الغياب مطلوب'),
        duration: Yup.number()
            .min(0.1, 'يجب أن تكون المدة 0.1 على الأقل')
            .max(24, 'لا يمكن أن تتجاوز المدة 24 ساعة')
            .test(
                'duration-required',
                'مدة الغياب مطلوبة',
                function (value) {
                    return this.parent.type === 'غياب كامل' || !!value;
                }
            ),
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

                const finalValues = {
                    ...values,
                    date: values.date.toISOString(),
                    // Fix 3: Ensure proper duration handling
                    duration: values.type === 'غياب كامل' ? 8 : parseFloat(values.duration)
                };

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Add credentials for authentication
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
                const response = await fetch(`${apiUrl}/api/employees`, {
                    credentials: 'include' // Add credentials
                });
                const data = await response.json();
                setEmployees(data.data || []);
            } catch (error) {
                toast.error('فشل في جلب بيانات الموظفين');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();

        // Fix 4: Ensure DatePicker loads properly
        setIsDatePickerLoaded(true);
    }, []);

    const inputClass = (touched, error) =>
        `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched && error ? 'border-red-500' : 'border-gray-300'
        }`;

    if (isLoading) return <div className="text-center py-8">جاري التحميل...</div>;

    return (
        <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <FaUser />
                    </div>
                    {absence ? 'تعديل بيانات الغياب' : 'إضافة غياب جديد'}
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* تحسين حقل الموظف */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <FaUser className="text-blue-600" /> الموظف
                        </label>
                        <select
                            name="employee"
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.employee && formik.errors.employee
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300 hover:border-blue-400'
                                } bg-gray-50`}
                            value={formik.values.employee}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
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


                    {/* تحسين حقل نوع الغياب */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-600"></div> نوع الغياب
                        </label>
                        <select
                            name="type"
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.type && formik.errors.type
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300 hover:border-blue-400'
                                } bg-gray-50`}
                            value={formik.values.type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
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

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <FaCalendarAlt className="text-blue-600" /> تاريخ الغياب
                        </label>
                        <div className="relative">
                            {isDatePickerLoaded && (
                                <DatePicker
                                    selected={formik.values.date}
                                    onChange={(date) => formik.setFieldValue('date', date)}
                                    dateFormat="yyyy/MM/dd"
                                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.date && formik.errors.date
                                        ? 'border-red-500 ring-1 ring-red-500'
                                        : 'border-gray-300 hover:border-blue-400'
                                        } bg-gray-50`}
                                />
                            )}
                            <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        {formik.touched.date && formik.errors.date && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.date}
                            </p>
                        )}
                    </div>

                    {formik.values.type !== 'غياب كامل' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <FaClock className="text-blue-600" /> المدة (ساعات)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="duration"
                                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.duration && formik.errors.duration
                                        ? 'border-red-500 ring-1 ring-red-500'
                                        : 'border-gray-300 hover:border-blue-400'
                                        } bg-gray-50`}
                                    value={formik.values.duration}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    min="0.1"
                                    max="24"
                                    step="0.1"
                                    placeholder="أدخل المدة..."
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaClock className="text-gray-400" />
                                </div>
                            </div>
                            {formik.touched.duration && formik.errors.duration && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaInfoCircle className="ml-1" /> {formik.errors.duration}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div> حالة الغياب
                        </label>
                        <select
                            name="status"
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.status && formik.errors.status
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300 hover:border-blue-400'
                                } bg-gray-50`}
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
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

                    <div className="md:col-span-2 space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <FaInfoCircle className="text-blue-600" /> سبب الغياب
                        </label>
                        <textarea
                            name="reason"
                            rows="3"
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${formik.touched.reason && formik.errors.reason
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300 hover:border-blue-400'
                                } bg-gray-50`}
                            value={formik.values.reason}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="أدخل سبب الغياب..."
                        ></textarea>
                        {formik.touched.reason && formik.errors.reason && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.reason}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ملاحظات (اختياري)
                        </label>
                        <textarea
                            name="notes"
                            rows="2"
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:border-blue-400 transition-all"
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                            placeholder="أدخل أي ملاحظات..."
                        ></textarea>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors hover:border-red-500 hover:text-red-600 font-medium"
                    >
                        <FaTimes /> إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSync className="animate-spin" /> جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <FaSave /> {absence ? 'تحديث' : 'حفظ'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AbsenceForm;