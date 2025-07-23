import Salary from "./salary.model.js";
import Employee from "../employee/employee.models.js";
import { errorHandler } from "../../utils/error.js";
import pdf from "html-pdf";

export const createSalary = async (req, res, next) => {
  try {
    const { employee: employeeId, month, year } = req.body;

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
    const totalAllowances =
      req.body.allowances?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
    const totalDeductions =
      req.body.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const insuranceAmount = req.body.socialInsurance?.amount || 0;
    const netSalary =
      (employee.salary || 0) +
      totalAllowances -
      totalDeductions -
      insuranceAmount;

    const salaryData = {
      ...req.body,
      employee: employeeId,
      baseSalary: employee.salary,
      netSalary,
      createdBy: req.user.id,
      status: req.body.status || "مسودة",
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

export const generatePayslip = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate(
        "employee",
        "fullName employeeId department jobTitle nationalId"
      )
      .populate("createdBy", "username");

    if (!salary) {
      return next(errorHandler(404, "سجل الراتب غير موجود"));
    }

    if (!salary.employee) {
      return next(errorHandler(400, "بيانات الموظف غير متوفرة"));
    }

    // إنشاء HTML بسيط
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>إقرار الراتب</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                }
                .document-title {
                    font-size: 20px;
                    margin: 10px 0;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">شركة مثال</div>
                <div class="document-title">إقرار الراتب الشهري</div>
            </div>
            
            <div class="section">
                <div class="section-title">معلومات الموظف</div>
                <table>
                    <tr>
                        <th>الاسم</th>
                        <td>${salary.employee.fullName}</td>
                    </tr>
                    <tr>
                        <th>رقم الموظف</th>
                        <td>${salary.employee.employeeId}</td>
                    </tr>
                    <tr>
                        <th>القسم</th>
                        <td>${salary.employee.department}</td>
                    </tr>
                    <tr>
                        <th>المسمى الوظيفي</th>
                        <td>${salary.employee.jobTitle}</td>
                    </tr>
                    <tr>
                        <th>الهوية الوطنية</th>
                        <td>${salary.employee.nationalId || "غير محدد"}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">تفاصيل الراتب</div>
                <table>
                    <tr>
                        <th>الشهر/السنة</th>
                        <td>${salary.month}/${salary.year}</td>
                    </tr>
                    <tr>
                        <th>الراتب الأساسي</th>
                        <td>${salary.baseSalary.toLocaleString(
                          "ar-IR"
                        )} د.ع</td>
                    </tr>
                </table>
            </div>
            
            ${
              salary.allowances?.length > 0
                ? `
            <div class="section">
                <div class="section-title">البدلات</div>
                <table>
                    <tr>
                        <th>النوع</th>
                        <th>المبلغ</th>
                    </tr>
                    ${salary.allowances
                      .map(
                        (a) => `
                        <tr>
                            <td>${a.type}</td>
                            <td>${a.amount.toLocaleString("ar-IR")}د.ع</td>
                        </tr>
                    `
                      )
                      .join("")}
                </table>
            </div>
            `
                : ""
            }
            
            ${
              salary.deductions?.length > 0
                ? `
            <div class="section">
                <div class="section-title">الخصومات</div>
                <table>
                    <tr>
                        <th>النوع</th>
                        <th>المبلغ</th>
                    </tr>
                    ${salary.deductions
                      .map(
                        (d) => `
                        <tr>
                            <td>${d.type}</td>
                            <td>${d.amount.toLocaleString("ar-IR")} د.ع</td>
                        </tr>
                    `
                      )
                      .join("")}
                </table>
            </div>
            `
                : ""
            }
            
            ${
              salary.socialInsurance?.amount > 0
                ? `
            <div class="section">
                <div class="section-title">التأمينات الاجتماعية</div>
                <table>
                    <tr>
                        <th>المبلغ</th>
                        <td>${salary.socialInsurance.amount.toLocaleString(
                          "ar-IR"
                        )} د.ع</td>
                    </tr>
                    <tr>
                        <th>النسبة</th>
                        <td>${salary.socialInsurance.percentage}%</td>
                    </tr>
                </table>
            </div>
            `
                : ""
            }
            
            <div class="section">
                <div class="section-title">الإجمالي</div>
                <table>
                    <tr>
                        <th>الراتب الصافي</th>
                        <td>${salary.netSalary.toLocaleString("ar-IR")}د.ع</td>
                    </tr>
                </table>
            </div>
            
            <div class="footer">
                <p>تم الإنشاء في: ${new Date().toLocaleDateString("ar-IR")}</p>
                <p>هذا المستند تم إنشاؤه تلقائياً ولا يحتاج إلى توقيع</p>
            </div>
        </body>
        </html>
        `;

    // خيارات PDF
    const options = {
      format: "A4",
      orientation: "portrait",
      border: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    };

    // إنشاء وإرسال PDF
    pdf.create(htmlContent, options).toStream((err, stream) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return next(errorHandler(500, "حدث خطأ أثناء إنشاء إقرار الراتب"));
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="payslip_${salary.employee.employeeId}_${salary.month}_${salary.year}.pdf"`
      );

      stream.pipe(res);
    });
  } catch (error) {
    console.error("Error generating payslip:", error);
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
      ...salary,
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
      },
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
