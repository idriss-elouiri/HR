'use client';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaMoneyBillWave, FaFileContract, FaPlus, FaTrash, FaCalendarAlt, FaPrint, FaSave, FaSync, FaInfoCircle } from 'react-icons/fa';
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
    // في useEffect الذي يعين القيم الأولية
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
                }
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
        },
        validationSchema,
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
        `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched && error ? 'border-red-500' : 'border-gray-300'
        }`;
    if (loading) return <div>جاري التحميل...</div>;
    if (error) return <div>حدث خطأ: {error}</div>;
    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">
                {selectedEmployee ? `إدارة راتب الموظف: ${selectedEmployee.fullName}` : 'إضافة راتب جديد'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* المعلومات الأساسية */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaMoneyBillWave className="ml-2" /> المعلومات الأساسية
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الموظف</label>
                        <Select
                            options={employees.map(emp => ({
                                value: emp._id,
                                label: `${emp.fullName} - ${emp.employeeId} (${emp.salary} ر.س)`
                            }))}
                            value={selectedEmployee ? {
                                value: selectedEmployee._id,
                                label: `${selectedEmployee.fullName} - ${selectedEmployee.employeeId} (${selectedEmployee.salary} ر.س)`
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
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
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
                        deduction
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الأساسي</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">حالة الراتب</label>
                        <Select
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === formik.values.status)}
                            onChange={(option) => formik.setFieldValue('status', option.value)}
                            className="basic-single"
                            classNamePrefix="select"
                        />
                    </div>
                </div>

                {/* الضمان الاجتماعي */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaFileContract className="ml-2" /> الضمان الاجتماعي
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">النسبة المئوية</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
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

            {/* البدلات والخصومات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* البدلات */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaPlus className="ml-2" /> البدلات
                    </h3>

                    <div className="space-y-4">
                        {formik.values.allowances?.map((allowance, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">النوع</label>
                                        <p>{allowance?.type || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">المبلغ</label>
                                        <p>{allowance.amount.toFixed(2)} ر.س</p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm text-gray-600 mb-1">الوصف</label>
                                    <p>{allowance.description || 'لا يوجد وصف'}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {new Date(allowance.date).toLocaleDateString('ar-EG')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeAllowance(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-700 mb-3">إضافة بدل جديد</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع البدل</label>
                                <Select
                                    options={allowanceTypes}
                                    value={allowanceTypes.find(opt => opt.value === formik.values.newAllowance.type)}
                                    onChange={(option) => formik.setFieldValue('newAllowance.type', option.value)}
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                                <input
                                    type="number"
                                    name="newAllowance.amount"
                                    value={formik.values.newAllowance.amount}
                                    onChange={formik.handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                <input
                                    type="text"
                                    name="newAllowance.description"
                                    value={formik.values.newAllowance.description}
                                    onChange={formik.handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="وصف اختياري"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addAllowance}
                                className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center"
                            >
                                <FaPlus className="ml-2" /> إضافة بدل
                            </button>
                        </div>
                    </div>
                </div>

                {/* الخصومات */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaTrash className="ml-2" /> الخصومات
                    </h3>

                    <div className="space-y-4">
                        {formik.values.deductions?.map((deduction, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">النوع</label>
                                        <p>{deduction?.type || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">المبلغ</label>
                                        <p>{deduction.amount.toFixed(2)} ر.س</p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm text-gray-600 mb-1">الوصف</label>
                                    <p>{deduction.description || 'لا يوجد وصف'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">الحالة</label>
                                        <p>{deduction.status}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">التاريخ</label>
                                        <p>{new Date(deduction.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeDeduction(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h4 className="font-medium text-red-700 mb-3">إضافة خصم جديد</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                                <Select
                                    options={deductionTypes}
                                    value={deductionTypes.find(opt => opt.value === formik.values.newDeduction.type)}
                                    onChange={(option) => formik.setFieldValue('newDeduction.type', option.value)}
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                                <input
                                    type="number"
                                    name="newDeduction.amount"
                                    value={formik.values.newDeduction.amount}
                                    onChange={formik.handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                <input
                                    type="text"
                                    name="newDeduction.description"
                                    value={formik.values.newDeduction.description}
                                    onChange={formik.handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="وصف اختياري"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
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
                                className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center"
                            >
                                <FaPlus className="ml-2" /> إضافة خصم
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* الملخص والحسابات */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <FaMoneyBillWave className="ml-2" /> ملخص الراتب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-600 mb-2">الراتب الأساسي</h4>
                        <p className="text-2xl font-bold text-blue-600">
                            {formik.values.baseSalary.toFixed(2)} ر.س
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-600 mb-2">إجمالي البدلات</h4>
                        <p className="text-2xl font-bold text-green-600">
                            {formik.values.allowances.reduce((sum, a) => sum + a.amount, 0).toFixed(2)} ر.س
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-600 mb-2">إجمالي الخصومات</h4>
                        <p className="text-2xl font-bold text-red-600">
                            {(formik.values.deductions.reduce((sum, d) => sum + d.amount, 0) + formik.values.socialInsurance.amount).toFixed(2)} ر.س
                        </p>
                    </div>
                </div>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-gray-800">صافي الراتب</h4>
                        <p className="text-3xl font-bold text-blue-700">
                            {calculateNetSalary().toFixed(2)} ر.س
                        </p>
                    </div>
                </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center"
                >
                    <FaSync className="ml-2" /> إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                {salary && (
                    <button
                        type="button"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        onClick={() => window.print()}
                    >
                        <FaPrint className="ml-2" /> طباعة الراتب
                    </button>
                )}
            </div>
        </form>)
}

export default SalaryForm;