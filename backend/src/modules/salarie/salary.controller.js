import Salary from "./salary.model.js";
import Employee from "../employee/employee.models.js"
import { errorHandler } from "../../utils/error.js";
import PDFDocument from 'pdfkit';
import fs from "fs";

export const createSalary = async (req, res, next) => {
    try {
        const { employeeId, month, year } = req.body;

        // التحقق من صحة البيانات المدخلة
        if (!employeeId || !month || !year) {
            return next(errorHandler(400, "جميع الحقول مطلوبة"));
        }

        // التحقق من وجود راتب لهذا الموظف لنفس الشهر والسنة
        const existingSalary = await Salary.findOne({
            employee: employeeId,
            month,
            year,
        });

        if (existingSalary) {
            return next(
                errorHandler(400, "تم تسجيل الراتب لهذا الموظف لهذا الشهر بالفعل")
            );
        }

        // جلب بيانات الموظف
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(errorHandler(404, "الموظف غير موجود"));
        }

        // حساب الراتب الصافي
        const totalAllowances = req.body.allowances?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
        const totalDeductions = req.body.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
        const insuranceAmount = req.body.socialInsurance?.amount || 0;
        const netSalary = (employee.salary || 0) + totalAllowances - totalDeductions - insuranceAmount;

        const salaryData = {
            ...req.body,
            employee: employeeId,
            baseSalary: employee.salary,
            netSalary,
            createdBy: req.user.id,
            status: req.body.status || "مسودة"
        };

        const salary = await Salary.create(salaryData);

        res.status(201).json({
            success: true,
            data: salary,
        });
    } catch (error) {
        next(error);
    }
};

export const getSalaries = async (req, res, next) => {
    try {
        const { employeeId, month, year, status } = req.query;
        const query = {};

        if (employeeId) query.employee = employeeId;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (status) query.status = status;

        const salaries = await Salary.find(query)
            .populate("employee", "fullName employeeId department")
            .populate("createdBy", "username")
            .sort({ year: -1, month: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: salaries,
        });
    } catch (error) {
        next(error);
    }
};

// باقي الدوال (getSalary, updateSalary, deleteSalary) تبقى كما هي مع تحسينات طفيفة

export const generatePayslip = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.id)
            .populate("employee", "fullName employeeId department jobTitle nationalId")
            .populate("createdBy", "username");

        if (!salary) {
            return next(errorHandler(404, "سجل الراتب غير موجود"));
        }

        if (!salary.employee) {
            return next(errorHandler(400, "بيانات الموظف غير متوفرة"));
        }

        // إنشاء مستند PDF
        const doc = new PDFDocument();
        const fileName = `payslip_${salary.employee.employeeId}_${salary.month}_${salary.year}.pdf`;

        // تعيين رؤوس الاستجابة
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        // إضافة محتوى PDF
        doc.fontSize(18).text('شركة مثال', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('إقرار الراتب الشهري', { align: 'center' });
        doc.moveDown();

        // معلومات الموظف
        doc.fontSize(14).text('معلومات الموظف:', { underline: true });
        doc.text(`الاسم: ${salary.employee.fullName}`);
        doc.text(`رقم الموظف: ${salary.employee.employeeId}`);
        doc.text(`القسم: ${salary.employee.department}`);
        doc.text(`المسمى الوظيفي: ${salary.employee.jobTitle}`);
        doc.moveDown();

        // تفاصيل الراتب
        doc.fontSize(14).text('تفاصيل الراتب:', { underline: true });
        doc.text(`الشهر: ${salary.month}/${salary.year}`);
        doc.text(`الراتب الأساسي: ${salary.baseSalary.toLocaleString('ar-SA')} ر.س`);
        doc.moveDown();

        // إضافة البدلات
        if (salary.allowances && salary.allowances.length > 0) {
            doc.fontSize(12).text('البدلات:', { underline: true });
            salary.allowances.forEach(allowance => {
                doc.text(`${allowance.type}: ${allowance.amount.toLocaleString('ar-SA')} ر.س`);
            });
            doc.moveDown();
        }

        // إضافة الخصومات
        if (salary.deductions && salary.deductions.length > 0) {
            doc.fontSize(12).text('الخصومات:', { underline: true });
            salary.deductions.forEach(deduction => {
                doc.text(`${deduction.type}: ${deduction.amount.toLocaleString('ar-SA')} ر.س`);
            });
            doc.moveDown();
        }

        // الراتب الصافي
        doc.fontSize(14).text(`الراتب الصافي: ${salary.netSalary.toLocaleString('ar-SA')} ر.س`, { underline: true });
        doc.moveDown();

        doc.text(`حالة الراتب: ${salary.status}`);
        doc.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`);

        // إرسال PDF كاستجابة
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Error generating payslip:', error);
        next(errorHandler(500, "حدث خطأ أثناء إنشاء إقرار الراتب"));
    }
};

export const getSalary = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.id)
            .populate("employee", "fullName employeeId department jobTitle salary")
            .lean(); // تحويل إلى كائن عادي

        if (!salary) {
            return next(errorHandler(404, "السجل غير موجود"));
        }

        // إضافة قيم افتراضية إذا كانت غير موجودة
        const result = {
            allowances: [],
            deductions: [],
            socialInsurance: { amount: 0, percentage: 10 },
            ...salary
        };

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSalary = async (req, res, next) => {
    try {
        const updatedSalary = await Salary.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("employee", "fullName employeeId department");

        if (!updatedSalary) {
            return next(errorHandler(404, "السجل غير موجود"));
        }

        // تأكد من أن جميع الحقول موجودة في الناتج
        const result = {
            ...updatedSalary._doc,
            allowances: updatedSalary.allowances || [],
            deductions: updatedSalary.deductions || [],
            socialInsurance: updatedSalary.socialInsurance || {
                amount: 0,
                percentage: 10,
            }
        };

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSalary = async (req, res, next) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);

        if (!salary) {
            return next(errorHandler(404, "السجل غير موجود"));
        }

        res.status(200).json({
            success: true,
            message: "تم حذف سجل الراتب بنجاح",
        });
    } catch (error) {
        next(error);
    }
};