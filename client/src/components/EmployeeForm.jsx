'use client';

import { useState } from 'react';
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaFingerprint,
    FaSave,
    FaSync,
    FaInfoCircle,
    FaMoneyBillWave,
    FaUniversity,
    FaUserShield,
    FaGraduationCap,
    FaUser,
    FaIdCard,
    FaPhone,
    FaEnvelope,
    FaBriefcase,
    FaBuilding,
    FaUserTie,
    FaTrash,
    FaEdit,
    FaPlus,
    FaExclamationTriangle,
    FaFileAlt
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';


const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
    const handleDeleteClick = (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
            onDelete(id);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const validationSchema = Yup.object({
        employeeId: Yup.string().required('حقل مطلوب'),
        fullName: Yup.string().required('حقل مطلوب'),
        gender: Yup.string().required('حقل مطلوب'),
        maritalStatus: Yup.string().required('حقل مطلوب'),
        department: Yup.string().required('حقل مطلوب'),
        jobTitle: Yup.string().required('حقل مطلوب'),
        contractType: Yup.string().required('حقل مطلوب'),
        socialSecurityNumber: Yup.string()
            .matches(/^\d+$/, 'يجب أن يكون رقماً')
            .min(10, 'يجب أن يكون 10 أرقام على الأقل')
            .required('حقل مطلوب'),
        nationalId: Yup.string()
            .matches(/^\d+$/, 'يجب أن يكون رقماً')
            .min(10, 'يجب أن يكون 10 أرقام على الأقل')
            .required('حقل مطلوب'),
        phone: Yup.string()
            .matches(/^\+?[0-9]+$/, 'رقم هاتف غير صالح')
            .min(10, 'يجب أن يكون 10 أرقام على الأقل')
            .required('حقل مطلوب'),
        email: Yup.string().email('بريد إلكتروني غير صالح').required('حقل مطلوب'),
        address: Yup.string().min(10, 'العنوان قصير جداً').required('حقل مطلوب'),
        hireDate: Yup.date().required('حقل مطلوب'),
        employmentStatus: Yup.string().required('حقل مطلوب'),
        salary: Yup.number()
            .min(0, 'يجب أن يكون الرقم موجب')
            .required('حقل مطلوب'),
        bankAccount: Yup.string()
            .required('حقل مطلوب')
            .matches(/^\d+$/, 'يجب أن يحتوي على أرقام فقط'),
        emergencyContact: Yup.string()
            .min(10, 'يجب أن يكون 10 أحرف على الأقل')
            .required('حقل مطلوب'),
        qualifications: Yup.string().required('حقل مطلوب'),
        familyMembers: Yup.number()
            .min(0, 'يجب أن يكون الرقم موجب')
            .integer('يجب أن يكون عدد صحيح'),
        rank: Yup.string(),
        lastSalaryIncreaseDate: Yup.date().nullable(),
        lastSalaryIncreaseAmount: Yup.number()
            .min(0, 'يجب أن يكون الرقم موجب')
            .when('lastSalaryIncreaseDate', {
                is: (date) => date !== null && date !== undefined,
                then: (schema) => schema.required('مطلوب عند وجود تاريخ زيادة')
            }), appreciationLetters: Yup.boolean(),
        penalties: Yup.array().of(
            Yup.object().shape({
                date: Yup.date().required('تاريخ العقوبة مطلوب'),
                description: Yup.string().required('وصف العقوبة مطلوب')
            })
        )
    });

    const formik = useFormik({
        initialValues: {
            employeeId: employee?.employeeId || '',
            fullName: employee?.fullName || '',
            gender: employee?.gender || 'ذكر',
            maritalStatus: employee?.maritalStatus || 'أعزب',
            department: employee?.department || '',
            jobTitle: employee?.jobTitle || '',
            contractType: employee?.contractType || 'دوام كامل',
            socialSecurityNumber: employee?.socialSecurityNumber || '',
            nationalId: employee?.nationalId || '',
            phone: employee?.phone || '',
            email: employee?.email || '',
            address: employee?.address || '',
            hireDate: employee?.hireDate ? new Date(employee.hireDate) : null,
            employmentStatus: employee?.employmentStatus || 'نشط',
            salary: employee?.salary || '',
            bankAccount: employee?.bankAccount || '',
            emergencyContact: employee?.emergencyContact || '',
            qualifications: employee?.qualifications || '',
            familyMembers: employee?.familyMembers || 0,
            rank: employee?.rank || '',
            lastSalaryIncreaseDate: employee?.lastSalaryIncrease?.date ?
                new Date(employee.lastSalaryIncrease.date) :
                null,
            lastSalaryIncreaseAmount: employee?.lastSalaryIncrease?.amount || 0,
            appreciationLetters: employee?.appreciationLetters || false,
            penalties: employee?.penalties?.map(p => ({
                ...p,
                date: p.date ? new Date(p.date) : null
            })) || [],
            newPenaltyDate: null,
            newPenaltyDescription: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const url = employee ? `${apiUrl}/api/employees/${employee._id}` : `${apiUrl}/api/employees`;
                const method = employee ? 'PUT' : 'POST';

                const dataToSend = {
                    employeeId: values.employeeId.trim(),
                    fullName: values.fullName.trim(),
                    gender: values.gender,
                    maritalStatus: values.maritalStatus,
                    department: values.department.trim(),
                    jobTitle: values.jobTitle.trim(),
                    contractType: values.contractType,
                    socialSecurityNumber: values.socialSecurityNumber.trim(),
                    nationalId: values.nationalId.trim(),
                    phone: values.phone.trim(),
                    email: values.email.trim(),
                    address: values.address.trim(),
                    hireDate: values.hireDate ? values.hireDate.toISOString().split('T')[0] : null,
                    employmentStatus: values.employmentStatus,
                    salary: Number(values.salary) || 0,
                    bankAccount: values.bankAccount.trim(),
                    emergencyContact: values.emergencyContact.trim(),
                    qualifications: values.qualifications.trim(),
                    familyMembers: Number(values.familyMembers) || 0,
                    rank: values.rank.trim(),
                    appreciationLetters: Boolean(values.appreciationLetters),
                    penalties: values.penalties.map(p => ({
                        date: p.date ? p.date.toISOString().split('T')[0] : null,
                        description: p.description.trim()
                    }))
                };
                if (values.lastSalaryIncreaseDate) {
                    dataToSend.lastSalaryIncrease = {
                        date: values.lastSalaryIncreaseDate.toISOString().split('T')[0],
                        amount: Number(values.lastSalaryIncreaseAmount) || 0
                    };
                }

                const response = await fetch(url, {
                    method,
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend), // أرسل dataToSend مباشرة دون تضمينها في كائن آخر
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || JSON.stringify(errorData.errors));
                }

                onSuccess();
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsSubmitting(false);
            }
        },
    });
    const addPenalty = () => {
        if (formik.values.newPenaltyDate && formik.values.newPenaltyDescription) {
            const newPenalty = {
                date: formik.values.newPenaltyDate,
                description: formik.values.newPenaltyDescription
            };

            formik.setFieldValue('penalties', [...formik.values.penalties, newPenalty]);
            formik.setFieldValue('newPenaltyDate', null);
            formik.setFieldValue('newPenaltyDescription', '');
        }
    };

    // دالة لحذف عقوبة
    const removePenalty = (index) => {
        const updatedPenalties = [...formik.values.penalties];
        updatedPenalties.splice(index, 1);
        formik.setFieldValue('penalties', updatedPenalties);
    };

    const inputClass = (touched, error) =>
        `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${touched && error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-300'
        }`;

    const sectionClass = "space-y-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300";
    const sectionHeaderClass = "text-lg font-semibold text-blue-700 flex items-center pb-2 border-b border-blue-100";

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-center text-blue-800 bg-white py-4 rounded-xl shadow-sm border-b-4 border-blue-500">
                {employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* المعلومات الأساسية */}
                <div className={sectionClass}>
                    <h3 className={sectionHeaderClass}>
                        <FaUser className="ml-2 text-blue-500" /> المعلومات الأساسية
                    </h3>
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموظف</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formik.values.employeeId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClass(formik.touched.employeeId, formik.errors.employeeId)}
                                />
                                <FaFingerprint className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            {formik.touched.employeeId && formik.errors.employeeId && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaInfoCircle className="ml-1" /> {formik.errors.employeeId}
                                </p>
                            )}
                        </div>

                        {/* حقل الاسم الكامل */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formik.values.fullName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClass(formik.touched.fullName, formik.errors.fullName)}
                                />
                                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            {formik.touched.fullName && formik.errors.fullName && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaInfoCircle className="ml-1" /> {formik.errors.fullName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaUser className="ml-1 text-sm text-blue-500" /> الجنس
                            </label>
                            <div className="flex space-x-2">
                                {['ذكر', 'أنثى'].map((option) => (
                                    <label
                                        key={option}
                                        className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition-colors ${formik.values.gender === option
                                            ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option}
                                            onChange={formik.handleChange}
                                            className="hidden"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaUser className="ml-1 text-sm text-blue-500" /> الحالة الاجتماعية
                            </label>
                            <select
                                name="maritalStatus"
                                value={formik.values.maritalStatus}
                                onChange={formik.handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {['أعزب', 'متزوج', 'مطلق', 'أرمل'].map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="nationalId"
                                value={formik.values.nationalId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.nationalId, formik.errors.nationalId)}
                            />
                            <FaFingerprint className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.nationalId && formik.errors.nationalId && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.nationalId}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الضمان الاجتماعي</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="socialSecurityNumber"
                                value={formik.values.socialSecurityNumber}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.socialSecurityNumber, formik.errors.socialSecurityNumber)}
                            />
                            <FaIdCard className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.socialSecurityNumber && formik.errors.socialSecurityNumber && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.socialSecurityNumber}
                            </p>
                        )}
                    </div>
                </div>

                {/* معلومات الاتصال */}
                <div className={sectionClass}>
                    <h3 className={sectionHeaderClass}>
                        <FaPhone className="ml-2 text-blue-500" /> معلومات الاتصال
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.phone, formik.errors.phone)}
                            />
                            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.phone && formik.errors.phone && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.phone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.email, formik.errors.email)}
                            />
                            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.address, formik.errors.address)}
                            />
                            <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.address && formik.errors.address && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.address}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">جهة الاتصال للطوارئ</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="emergencyContact"
                                value={formik.values.emergencyContact}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.emergencyContact, formik.errors.emergencyContact)}
                            />
                            <FaUserShield className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.emergencyContact && formik.errors.emergencyContact && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.emergencyContact}
                            </p>
                        )}
                    </div>
                </div>

                {/* المعلومات الوظيفية */}
                <div className={sectionClass}>
                    <h3 className={sectionHeaderClass}>
                        <FaBriefcase className="ml-2 text-blue-500" /> المعلومات الوظيفية
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="department"
                                value={formik.values.department}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.department, formik.errors.department)}
                            />
                            <FaBuilding className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.department && formik.errors.department && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.department}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="jobTitle"
                                value={formik.values.jobTitle}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.jobTitle, formik.errors.jobTitle)}
                            />
                            <FaUserTie className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.jobTitle && formik.errors.jobTitle && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.jobTitle}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقد</label>
                        <select
                            name="contractType"
                            value={formik.values.contractType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass(formik.touched.contractType, formik.errors.contractType)}
                        >
                            <option value="دوام كامل">دوام كامل</option>
                            <option value="دوام جزئي">دوام جزئي</option>
                            <option value="مؤقت">مؤقت</option>
                        </select>
                        {formik.touched.contractType && formik.errors.contractType && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.contractType}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">حالة التوظيف</label>
                        <select
                            name="employmentStatus"
                            value={formik.values.employmentStatus}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass(formik.touched.employmentStatus, formik.errors.employmentStatus)}
                        >
                            <option value="نشط">نشط</option>
                            <option value="موقوف">موقوف</option>
                            <option value="مفصول">مفصول</option>
                        </select>
                        {formik.touched.employmentStatus && formik.errors.employmentStatus && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.employmentStatus}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التوظيف</label>
                        <div className="relative">
                            <DatePicker
                                selected={formik.values.hireDate}
                                onChange={(date) => formik.setFieldValue('hireDate', date)}
                                onBlur={() => formik.setFieldTouched('hireDate', true)}
                                dateFormat="yyyy/MM/dd"
                                className={inputClass(formik.touched.hireDate, formik.errors.hireDate)}
                                placeholderText="اختر تاريخ التوظيف"
                            />
                            <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.hireDate && formik.errors.hireDate && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.hireDate}
                            </p>
                        )}
                    </div>
                </div>

                {/* المعلومات المالية والتعليمية */}
                <div className={sectionClass}>
                    <h3 className={sectionHeaderClass}>
                        <FaMoneyBillWave className="ml-2 text-blue-500" /> المعلومات المالية والتعليمية
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الأساسي</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="salary"
                                value={formik.values.salary}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.salary, formik.errors.salary)}
                            />
                            <FaMoneyBillWave className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.salary && formik.errors.salary && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.salary}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب البنكي</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="bankAccount"
                                value={formik.values.bankAccount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.bankAccount, formik.errors.bankAccount)}
                            />
                            <FaUniversity className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.bankAccount && formik.errors.bankAccount && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.bankAccount}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المؤهلات العلمية</label>
                        <div className="relative">
                            <textarea
                                name="qualifications"
                                value={formik.values.qualifications}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${inputClass(formik.touched.qualifications, formik.errors.qualifications)} min-h-[100px]`}
                            />
                            <FaGraduationCap className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {formik.touched.qualifications && formik.errors.qualifications && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <FaInfoCircle className="ml-1" /> {formik.errors.qualifications}
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaFileAlt className="ml-2 text-blue-500" /> معلومات إضافية
                        </h3>


                        {/* عدد أفراد الأسرة */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">عدد أفراد الأسرة</label>
                            <div className="flex">
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('familyMembers', Math.max(0, formik.values.familyMembers - 1))}
                                    className="px-4 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-300"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    name="familyMembers"
                                    value={formik.values.familyMembers}
                                    onChange={formik.handleChange}
                                    className="flex-1 text-center p-3 border-y border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('familyMembers', formik.values.familyMembers + 1)}
                                    className="px-4 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300"
                                >
                                    +
                                </button>
                            </div>
                        </div>


                        {/* الرتبة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الرتبة</label>
                            <input
                                type="text"
                                name="rank"
                                value={formik.values.rank}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.rank, formik.errors.rank)}
                            />
                        </div>

                        {/* كتب الشكر والتقدير */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="appreciationLetters"
                                name="appreciationLetters"
                                checked={formik.values.appreciationLetters}
                                onChange={formik.handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="appreciationLetters" className="ml-2 block text-sm text-gray-700">
                                حصل على كتب شكر وتقدير
                            </label>
                        </div>
                    </div>

                    {/* معلومات الزيادة في الراتب */}
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaMoneyBillWave className="ml-2 text-blue-500" /> آخر زيادة في الراتب
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ آخر زيادة</label>
                            <DatePicker
                                selected={formik.values.lastSalaryIncreaseDate}
                                onChange={(date) => formik.setFieldValue('lastSalaryIncreaseDate', date)}
                                dateFormat="yyyy/MM/dd"
                                className={inputClass(formik.touched.lastSalaryIncreaseDate, formik.errors.lastSalaryIncreaseDate)}
                                placeholderText="اختر تاريخ الزيادة"
                                isClearable
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">مقدار الزيادة</label>
                            <input
                                type="number"
                                name="lastSalaryIncreaseAmount"
                                value={formik.values.lastSalaryIncreaseAmount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClass(formik.touched.lastSalaryIncreaseAmount, formik.errors.lastSalaryIncreaseAmount)}
                                min="0"
                                disabled={!formik.values.lastSalaryIncreaseDate}
                            />
                        </div>
                    </div>
                </div>

                {/* قسم العقوبات */}
                <div className="col-span-full">
                    <div className={sectionClass}>
                        <h3 className={sectionHeaderClass}>
                            <FaExclamationTriangle className="ml-2 text-blue-500" /> العقوبات
                        </h3>

                        {/* تصميم جديد للعقوبات */}
                        {formik.values.penalties.length > 0 && (
                            <div className="overflow-hidden rounded-lg border border-gray-200 mb-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* ... (بقية الجدول) */}
                                </table>
                            </div>
                        )}

                        {/* تصميم جديد لإضافة عقوبة */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ العقوبة</label>
                                <DatePicker
                                    selected={formik.values.newPenaltyDate}
                                    onChange={(date) => formik.setFieldValue('newPenaltyDate', date)}
                                    dateFormat="yyyy/MM/dd"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="اختر تاريخ العقوبة"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وصف العقوبة</label>
                                <input
                                    type="text"
                                    value={formik.values.newPenaltyDescription}
                                    onChange={(e) => formik.setFieldValue('newPenaltyDescription', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل وصف العقوبة"
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={addPenalty}
                                    className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center transition-colors"
                                >
                                    <FaPlus className="ml-2" /> إضافة عقوبة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* تصميم جديد لأزرار الحفظ والإلغاء */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <FaTrash className="ml-2" /> إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                >
                    {isSubmitting ? (
                        <>
                            <FaSync className="animate-spin ml-2" /> جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <FaSave className="ml-2" /> {employee ? 'تحديث البيانات' : 'حفظ البيانات'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;