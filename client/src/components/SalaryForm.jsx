'use client';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaMoneyBillWave, FaFileContract, FaPlus, FaTrash, FaCalendarAlt, FaPrint, FaSave, FaSync, FaInfoCircle, FaCreditCard, FaStickyNote } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const allowanceTypes = [
    { value: 'سنوية', label: 'بدل سنوية' },
    { value: 'مكافأة', label: 'مكافأة' },
    { value: 'حافز', label: 'حافز' },
    { value: 'أخرى', label: 'بدل أخرى' }
];

const deductionTypes = [
    { value: 'سلفة', label: 'سلفة' },
    { value: 'غرامة', label: 'غرامة' },
    { value: 'تأمينات', label: 'تأمينات' },
    { value: 'ضريبة', label: 'ضريبة' },
    { value: 'أخرى', label: 'خصم آخر' }
];

const statusOptions = [
    { value: 'مسودة', label: 'مسودة' },
    { value: 'معتمدة', label: 'معتمدة' },
    { value: 'مسددة', label: 'مسددة' },
    { value: 'ملغاة', label: 'ملغاة' }
];

const deductionStatusOptions = [
    { value: 'معلقة', label: 'معلقة' },
    { value: 'مسددة', label: 'مسددة' },
    { value: 'ملغاة', label: 'ملغاة' }
];

const paymentMethodOptions = [
    { value: 'نقدي', label: 'نقدي' },
    { value: 'تحويل بنكي', label: 'تحويل بنكي' },
    { value: 'شيك', label: 'شيك' },
    { value: 'بطاقة ائتمان', label: 'بطاقة ائتمان' }
];

const SalaryForm = ({ employee: initialEmployee, onSuccess, onCancel, salary }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee || null);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const validationSchema = Yup.object({
        month: Yup.number()
            .required('حقل مطلوب')
            .min(1, 'يجب أن يكون بين 1 و 12')
            .max(12, 'يجب أن يكون بين 1 و 12'),
        year: Yup.number()
            .required('حقل مطلوب')
            .min(2000, 'يجب أن يكون سنة صحيحة'),
        baseSalary: Yup.number()
            .required('حقل مطلوب')
            .min(0, 'يجب أن يكون رقم موجب'),
        allowances: Yup.array().of(
            Yup.object().shape({
                type: Yup.string().required('نوع البدل مطلوب'),
                amount: Yup.number()
                    .required('المبلغ مطلوب')
                    .min(0, 'يجب أن يكون رقم موجب'),
                description: Yup.string(),
                date: Yup.date().required('التاريخ مطلوب'),
            })
        ),
        deductions: Yup.array().of(
            Yup.object().shape({
                type: Yup.string().required('نوع الخصم مطلوب'),
                amount: Yup.number()
                    .required('المبلغ مطلوب')
                    .min(0, 'يجب أن يكون رقم موجب'),
                description: Yup.string(),
                date: Yup.date().required('التاريخ مطلوب'),
                status: Yup.string(),
            })
        ),
        socialInsurance: Yup.object().shape({
            amount: Yup.number().min(0, 'يجب أن يكون رقم موجب'),
            percentage: Yup.number().min(0, 'يجب أن يكون رقم موجب').max(100, 'لا يمكن أن تتجاوز النسبة 100%'),
        }),
        status: Yup.string().required('حالة الراتب مطلوبة'),

        paymentDate: Yup.date().when('status', {
            is: (status) => status === 'مسددة',
            then: Yup.date().required('تاريخ الدفع مطلوب')
        }),

        paymentMethod: Yup.string().when('status', {
            is: (status) => status === 'مسددة',
            then: Yup.string().required('طريقة الدفع مطلوبة')
        }),

        paymentReference: Yup.string().when('status', {
            is: (status) => status === 'مسددة',
            then: Yup.string().required('مرجع الدفع مطلوب')
        }),
    });

    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
            const response = await fetch(`${apiUrl}/api/employees`, {
                credentials: 'include'
            });
            const data = await response.json();
            setEmployees(data.data || data || []);
        } catch (err) {
            toast.error('فشل في جلب بيانات الموظفين');
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (salary) {
            const formattedSalary = {
                ...salary,
                allowances: (salary.allowances || []).map(a => ({
                    type: a.type || 'سنوية',
                    amount: a.amount || 0,
                    description: a.description || '',
                    date: a.date ? new Date(a.date) : new Date()
                })),
                deductions: (salary.deductions || []).map(d => ({
                    type: d.type || 'سلفة',
                    amount: d.amount || 0,
                    description: d.description || '',
                    date: d.date ? new Date(d.date) : new Date(),
                    status: d.status || 'معلقة'
                })),
                socialInsurance: salary.socialInsurance || {
                    amount: 0,
                    percentage: 10
                },
                newAllowance: {
                    type: 'سنوية',
                    amount: 0,
                    description: '',
                    date: new Date(),
                },
                newDeduction: {
                    type: 'سلفة',
                    amount: 0,
                    description: '',
                    date: new Date(),
                    status: 'معلقة',
                },
                paymentDate: salary.paymentDate ? new Date(salary.paymentDate) : null
            };
            formik.setValues(formattedSalary);

            if (salary.employee) {
                const emp = employees.find(e => e._id === salary.employee._id || e._id === salary.employee);
                if (emp) setSelectedEmployee(emp);
            }
        }
    }, [salary, employees]);

    const formik = useFormik({
        initialValues: {
            month: salary?.month || new Date().getMonth() + 1,
            year: salary?.year || new Date().getFullYear(),
            baseSalary: salary?.baseSalary || selectedEmployee?.salary || 0,
            allowances: salary?.allowances || [],
            deductions: salary?.deductions || [],
            socialInsurance: salary?.socialInsurance || {
                amount: 0,
                percentage: 10,
            },
            status: salary?.status || 'مسودة',
            newAllowance: {
                type: 'سنوية',
                amount: 0,
                description: '',
                date: new Date(),
            },
            newDeduction: {
                type: 'سلفة',
                amount: 0,
                description: '',
                date: new Date(),
                status: 'معلقة',
            },
            paymentDate: salary?.paymentDate || null,
            paymentMethod: salary?.paymentMethod || '',
            paymentReference: salary?.paymentReference || '',
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                if (!selectedEmployee) {
                    throw new Error('يجب اختيار موظف');
                }

                const dataToSend = {
                    ...values,
                    employee: selectedEmployee._id,
                    allowances: values.allowances.map(a => ({
                        type: a.type || 'سنوية',
                        amount: a.amount || 0,
                        description: a.description || '',
                        date: a.date?.toISOString() || new Date().toISOString()
                    })),
                    deductions: values.deductions.map(d => ({
                        type: d.type || 'سلفة',
                        amount: d.amount || 0,
                        description: d.description || '',
                        date: d.date?.toISOString() || new Date().toISOString(),
                        status: d.status || 'معلقة'
                    })),
                    paymentDate: values.paymentDate?.toISOString(),
                    paymentMethod: values.paymentMethod,
                    paymentReference: values.paymentReference,
                    netSalary: calculateNetSalary(),
                };

                // إزالة الحقول غير الضرورية
                delete dataToSend.employeeId;
                delete dataToSend.newAllowance;
                delete dataToSend.newDeduction;

                const method = salary ? 'PUT' : 'POST';
                const url = salary
                    ? `${apiUrl}/api/salaries/${salary._id}`
                    : `${apiUrl}/api/salaries`;

                const response = await fetch(url, {
                    method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'حدث خطأ أثناء الحفظ');
                }

                onSuccess();
                toast.success('تم حفظ بيانات الراتب بنجاح');
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsSubmitting(false);
            }
        },
    });


    const addAllowance = () => {
        if (formik.values.newAllowance.amount > 0) {
            formik.setFieldValue('allowances', [
                ...formik.values.allowances,
                formik.values.newAllowance,
            ]);
            formik.setFieldValue('newAllowance', {
                type: 'سنوية',
                amount: 0,
                description: '',
                date: new Date(),
            });
        } else {
            toast.warning('يجب إدخال مبلغ البدل');
        }
    };

    const removeAllowance = (index) => {
        const updatedAllowances = [...formik.values.allowances];
        updatedAllowances.splice(index, 1);
        formik.setFieldValue('allowances', updatedAllowances);
    };

    const addDeduction = () => {
        if (formik.values.newDeduction.amount > 0) {
            formik.setFieldValue('deductions', [
                ...formik.values.deductions,
                formik.values.newDeduction,
            ]);
            formik.setFieldValue('newDeduction', {
                type: 'سلفة',
                amount: 0,
                description: '',
                date: new Date(),
                status: 'معلقة',
            });
        } else {
            toast.warning('يجب إدخال مبلغ الخصم');
        }
    };

    const removeDeduction = (index) => {
        const updatedDeductions = [...formik.values.deductions];
        updatedDeductions.splice(index, 1);
        formik.setFieldValue('deductions', updatedDeductions);
    };

    const calculateNetSalary = () => {
        const totalAllowances = formik.values.allowances.reduce(
            (sum, allowance) => sum + (allowance.amount || 0),
            0
        );
        const totalDeductions = formik.values.deductions.reduce(
            (sum, deduction) => sum + (deduction.amount || 0),
            0
        );
        const insuranceDeduction = formik.values.socialInsurance.amount || 0;

        return Math.max(
            0,
            formik.values.baseSalary + totalAllowances - totalDeductions - insuranceDeduction
        );
    };

    useEffect(() => {
        if (selectedEmployee) {
            formik.setFieldValue('baseSalary', selectedEmployee.salary || 0);
        }
    }, [selectedEmployee]);

    const inputClass = (touched, error) =>
        `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched && error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-300'
        }`;

    const sectionClass = "bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300";
    const sectionHeaderClass = "text-lg font-semibold text-blue-700 flex items-center pb-2 border-b border-blue-100";

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-blue-800 font-medium">جاري تحميل بيانات الراتب...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-red-200">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaInfoCircle className="text-red-600 text-3xl" />
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">حدث خطأ</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto"
                >
                    <FaSync className="ml-2" /> إعادة المحاولة
                </button>
            </div>
        </div>
    );

    return (
        <form onSubmit={formik.handleSubmit} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 mb-8 shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-center">
                        {selectedEmployee ? `إدارة راتب الموظف: ${selectedEmployee.fullName}` : 'إضافة راتب جديد'}
                    </h1>
                    <p className="text-center text-blue-100 mt-2">
                        نظام متكامل لإدارة رواتب الموظفين بدقة واحترافية
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* المعلومات الأساسية */}
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaMoneyBillWave className="ml-2 text-blue-500" /> المعلومات الأساسية
                        </h3>

                        <div className="space-y-5 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
                                <Select
                                    options={employees.map(emp => ({
                                        value: emp._id,
                                        label: `${emp.fullName} - ${emp.employeeId} (${emp.salary} د.ع)`
                                    }))}
                                    value={selectedEmployee ? {
                                        value: selectedEmployee._id,
                                        label: `${selectedEmployee.fullName} - ${selectedEmployee.employeeId} (${selectedEmployee.salary} د.ع)`
                                    } : null}
                                    onChange={(option) => {
                                        const emp = employees.find(e => e._id === option.value);
                                        setSelectedEmployee(emp || null);
                                    }}
                                    placeholder="اختر الموظف..."
                                    isDisabled={!!salary}
                                    isLoading={isLoadingEmployees}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            border: formik.touched.employee && formik.errors.employee
                                                ? '1px solid #EF4444'
                                                : base.border,
                                            backgroundColor: formik.touched.employee && formik.errors.employee
                                                ? '#FEF2F2'
                                                : base.backgroundColor
                                        })
                                    }}
                                />
                                {formik.touched.employee && formik.errors.employee && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <FaInfoCircle className="ml-1" /> {formik.errors.employee}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                                    <input
                                        type="number"
                                        name="month"
                                        value={formik.values.month}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={inputClass(formik.touched.month, formik.errors.month)}
                                        min="1"
                                        max="12"
                                    />
                                    {formik.touched.month && formik.errors.month && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <FaInfoCircle className="ml-1" /> {formik.errors.month}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formik.values.year}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={inputClass(formik.touched.year, formik.errors.year)}
                                        min="2000"
                                        max="2100"
                                    />
                                    {formik.touched.year && formik.errors.year && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <FaInfoCircle className="ml-1" /> {formik.errors.year}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الراتب الأساسي</label>
                                <input
                                    type="number"
                                    name="baseSalary"
                                    value={formik.values.baseSalary}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClass(formik.touched.baseSalary, formik.errors.baseSalary)}
                                    min="0"
                                    step="0.01"
                                />
                                {formik.touched.baseSalary && formik.errors.baseSalary && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <FaInfoCircle className="ml-1" /> {formik.errors.baseSalary}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الراتب</label>
                                <select
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClass(formik.touched.status, formik.errors.status)}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formik.values.status === 'مسددة' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الدفع</label>
                                        <DatePicker
                                            selected={formik.values.paymentDate}
                                            onChange={date => formik.setFieldValue('paymentDate', date)}
                                            dateFormat="yyyy/MM/dd"
                                            className={inputClass(
                                                formik.touched.paymentDate,
                                                formik.errors.paymentDate
                                            )}
                                            placeholderText="اختر تاريخ الدفع"
                                        />
                                        {formik.touched.paymentDate && formik.errors.paymentDate && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <FaInfoCircle className="ml-1" /> {formik.errors.paymentDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                        <select
                                            name="paymentMethod"
                                            value={formik.values.paymentMethod}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={inputClass(
                                                formik.touched.paymentMethod,
                                                formik.errors.paymentMethod
                                            )}
                                        >
                                            <option value="">اختر طريقة الدفع</option>
                                            {paymentMethodOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <FaInfoCircle className="ml-1" /> {formik.errors.paymentMethod}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">مرجع الدفع</label>
                                        <input
                                            type="text"
                                            name="paymentReference"
                                            value={formik.values.paymentReference}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={inputClass(
                                                formik.touched.paymentReference,
                                                formik.errors.paymentReference
                                            )}
                                            placeholder="رقم المرجع أو الوصف"
                                        />
                                        {formik.touched.paymentReference && formik.errors.paymentReference && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <FaInfoCircle className="ml-1" /> {formik.errors.paymentReference}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* الضمان الاجتماعي */}
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaFileContract className="ml-2 text-blue-500" /> الضمان الاجتماعي
                        </h3>

                        <div className="space-y-5 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">النسبة المئوية</label>
                                <input
                                    type="number"
                                    name="socialInsurance.percentage"
                                    value={formik.values.socialInsurance.percentage}
                                    onChange={(e) => {
                                        const percentage = parseFloat(e.target.value) || 0;
                                        const amount = (formik.values.baseSalary * percentage) / 100;
                                        formik.setFieldValue('socialInsurance.percentage', percentage);
                                        formik.setFieldValue('socialInsurance.amount', amount);
                                    }}
                                    className={inputClass(
                                        formik.touched.socialInsurance?.percentage,
                                        formik.errors.socialInsurance?.percentage
                                    )}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                                {formik.touched.socialInsurance?.percentage && formik.errors.socialInsurance?.percentage && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <FaInfoCircle className="ml-1" /> {formik.errors.socialInsurance.percentage}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                                <input
                                    type="number"
                                    name="socialInsurance.amount"
                                    value={formik.values.socialInsurance.amount}
                                    onChange={(e) => {
                                        const amount = parseFloat(e.target.value) || 0;
                                        const percentage = (amount / formik.values.baseSalary) * 100;
                                        formik.setFieldValue('socialInsurance.amount', amount);
                                        formik.setFieldValue('socialInsurance.percentage', percentage.toFixed(2));
                                    }}
                                    className={inputClass(
                                        formik.touched.socialInsurance?.amount,
                                        formik.errors.socialInsurance?.amount
                                    )}
                                    min="0"
                                    step="0.01"
                                />
                                {formik.touched.socialInsurance?.amount && formik.errors.socialInsurance?.amount && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <FaInfoCircle className="ml-1" /> {formik.errors.socialInsurance.amount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* البدلات والخصومات */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* البدلات */}
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaPlus className="ml-2 text-green-500" /> البدلات
                        </h3>

                        <div className="space-y-4 mt-4">
                            {formik.values.allowances?.map((allowance, index) => (
                                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm text-green-700 mb-1">النوع</label>
                                            <p className="font-medium">{allowance?.type || 'غير محدد'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-green-700 mb-1">المبلغ</label>
                                            <p className="font-bold text-green-800">{allowance.amount.toFixed(2)} د.ع</p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm text-green-700 mb-1">الوصف</label>
                                        <p className="text-gray-700">{allowance.description || 'لا يوجد وصف'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-green-600">
                                            {new Date(allowance.date).toLocaleDateString('ar-EG')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAllowance(index)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {formik.values.allowances?.length === 0 && (
                                <div className="text-center py-6 text-gray-500">
                                    <FaInfoCircle className="mx-auto text-xl mb-2" />
                                    <p>لم يتم إضافة أي بدلات بعد</p>
                                </div>
                            )}

                            <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                    <FaPlus className="ml-2" /> إضافة بدل جديد
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-green-700 mb-2">نوع البدل</label>
                                        <Select
                                            options={allowanceTypes}
                                            value={allowanceTypes.find(opt => opt.value === formik.values.newAllowance.type)}
                                            onChange={(option) => formik.setFieldValue('newAllowance.type', option.value)}
                                            className="basic-single"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-green-700 mb-2">المبلغ</label>
                                        <input
                                            type="number"
                                            name="newAllowance.amount"
                                            value={formik.values.newAllowance.amount}
                                            onChange={formik.handleChange}
                                            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-green-700 mb-2">الوصف</label>
                                        <input
                                            type="text"
                                            name="newAllowance.description"
                                            value={formik.values.newAllowance.description}
                                            onChange={formik.handleChange}
                                            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="وصف اختياري"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addAllowance}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
                                    >
                                        <FaPlus className="ml-2" /> إضافة بدل
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الخصومات */}
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaTrash className="ml-2 text-red-500" /> الخصومات
                        </h3>

                        <div className="space-y-4 mt-4">
                            {formik.values.deductions?.map((deduction, index) => (
                                <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm text-red-700 mb-1">النوع</label>
                                            <p className="font-medium">{deduction?.type || 'غير محدد'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-red-700 mb-1">المبلغ</label>
                                            <p className="font-bold text-red-800">{deduction.amount.toFixed(2)} د.ع</p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm text-red-700 mb-1">الوصف</label>
                                        <p className="text-gray-700">{deduction.description || 'لا يوجد وصف'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm text-red-700 mb-1">الحالة</label>
                                            <p className={`px-2 py-1 rounded-full text-xs ${deduction.status === 'معلقة' ? 'bg-yellow-100 text-yellow-800' :
                                                deduction.status === 'مسددة' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {deduction.status}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-red-700 mb-1">التاريخ</label>
                                            <p>{new Date(deduction.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeDeduction(index)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {formik.values.deductions?.length === 0 && (
                                <div className="text-center py-6 text-gray-500">
                                    <FaInfoCircle className="mx-auto text-xl mb-2" />
                                    <p>لم يتم إضافة أي خصومات بعد</p>
                                </div>
                            )}

                            <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                                <h4 className="font-medium text-red-800 mb-3 flex items-center">
                                    <FaPlus className="ml-2" /> إضافة خصم جديد
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">نوع الخصم</label>
                                        <Select
                                            options={deductionTypes}
                                            value={deductionTypes.find(opt => opt.value === formik.values.newDeduction.type)}
                                            onChange={(option) => formik.setFieldValue('newDeduction.type', option.value)}
                                            className="basic-single"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">المبلغ</label>
                                        <input
                                            type="number"
                                            name="newDeduction.amount"
                                            value={formik.values.newDeduction.amount}
                                            onChange={formik.handleChange}
                                            className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">الوصف</label>
                                        <input
                                            type="text"
                                            name="newDeduction.description"
                                            value={formik.values.newDeduction.description}
                                            onChange={formik.handleChange}
                                            className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            placeholder="وصف اختياري"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">الحالة</label>
                                        <Select
                                            options={deductionStatusOptions}
                                            value={deductionStatusOptions.find(opt => opt.value === formik.values.newDeduction.status)}
                                            onChange={(option) => formik.setFieldValue('newDeduction.status', option.value)}
                                            className="basic-single"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addDeduction}
                                        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center transition-colors"
                                    >
                                        <FaPlus className="ml-2" /> إضافة خصم
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* الملخص والحسابات */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                        <FaMoneyBillWave className="ml-2" /> ملخص الراتب
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-medium text-blue-100 mb-2">الراتب الأساسي</h4>
                            <p className="text-2xl font-bold">
                                {formik.values.baseSalary.toFixed(2)} د.ع
                            </p>
                        </div> 
                        <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-medium text-green-100 mb-2">إجمالي البدلات</h4>
                            <p className="text-2xl font-bold text-green-300">
                                +{formik.values.allowances.reduce((sum, a) => sum + a.amount, 0).toFixed(2)} د.ع
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-medium text-red-100 mb-2">إجمالي الخصومات</h4>
                            <p className="text-2xl font-bold text-red-300">
                                -{(formik.values.deductions.reduce((sum, d) => sum + d.amount, 0) + formik.values.socialInsurance.amount).toFixed(2)} د.ع
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-30 p-4 rounded-xl backdrop-blur-sm border-2 border-yellow-400">
                            <h4 className="font-medium text-yellow-100 mb-2">صافي الراتب</h4>
                            <p className="text-3xl font-bold text-yellow-300">
                                {calculateNetSalary().toFixed(2)} د.ع
                            </p>
                        </div>
                    </div>

                    {/* ملاحظات إضافية */}

                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <FaSync className="ml-2" /> إلغاء
                    </button>
                    {salary && (
                        <button
                            type="button"
                            className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            onClick={() => window.print()}
                        >
                            <FaPrint className="ml-2" /> طباعة الراتب
                        </button>
                    )}
                    <button
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
                                <FaSave className="ml-2" /> حفظ الراتب
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default SalaryForm;