"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaEdit, FaSave, FaTimes, FaBell } from "react-icons/fa";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
import Link from "next/link";

const EmployeeInfo = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // إضافة الحالات الجديدة
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [socialInsurance, setSocialInsurance] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState({});

  useEffect(() => {
    if (currentUser.isHR) {
      router.push("/dashboard");
      return;
    }

    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${apiUrl}/api/employees/by-employee-id/${currentUser.employee.employeeId}`
        );

        // قراءة الرد مرة واحدة فقط
        const responseData = await res.json();

        if (!res.ok) {
          console.error("Error response:", responseData);
          throw new Error(responseData.message || "فشل في جلب بيانات الموظف");
        }

        setEmployee(responseData.data);
        setFormData(responseData.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        setLoading(false);
      }
    };

    const fetchCompensationData = async () => {
      try {
        // جلب بيانات البدلات والخصومات
        const salaryRes = await fetch(
          `${apiUrl}/api/ ?employeeId=${currentUser.employee._id}&sort=-year,-month&limit=1`
        );
        const salaryData = await salaryRes.json();

        if (salaryRes.ok && salaryData.data?.length > 0) {
          const lastSalary = salaryData.data[0];
          setAllowances(lastSalary.allowances || []);
          setDeductions(lastSalary.deductions || []);
          setSocialInsurance(lastSalary.socialInsurance || null);
        }

        // جلب رصيد الإجازات
        const currentYear = new Date().getFullYear();
        const leaveRes = await fetch(
          `${apiUrl}/api/leaves/summary/${currentUser.employee._id}/${currentYear}`
        );
        const leaveData = await leaveRes.json();

        if (leaveRes.ok) {
          setLeaveSummary(leaveData.data || {});
        }
      } catch (error) {
        console.error("فشل في جلب بيانات التعويضات:", error);
      }
    };

    fetchEmployeeData();
    if (currentUser.employee?._id) {
      fetchCompensationData();
    }
  }, [currentUser, apiUrl]);

  // معالجة التغيير في حقول النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // تحديث بيانات الموظف
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await fetch(`${apiUrl}/api/employees/${employee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "فشل في تحديث البيانات");
      }

      setEmployee(data.data);
      setEditing(false);
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };
  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/notifications/employee/unread`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-xl">لا توجد بيانات للموظف</p>
      </div>
    );
  }

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const LeaveBalanceCard = ({ type, total, used }) => {
    const balance = total - used;
    const percentage = Math.min(100, (used / total) * 100);

    return (
      <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{type}</span>
          <span className="text-xl font-bold text-indigo-700">
            {balance} يوم
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {used} يوم مستخدم من {total}
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800">معلوماتي الشخصية</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaEdit /> تعديل المعلومات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={updating}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <FaSave /> {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              <FaTimes /> إلغاء
            </button>
          </div>
        )}
      </div>
      <div></div>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* معلومات أساسية */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24" />
              <div>
                <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                <p className="text-indigo-200">{employee.jobTitle}</p>
                <p className="text-indigo-200 mt-1">
                  {employee.department} • رقم الموظف: {employee.employeeId}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {employee.employmentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* معلومات تفصيلية */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* العمود الأول */}
            <div>
              <SectionTitle>المعلومات الشخصية</SectionTitle>
              <InfoField
                label="رقم الهوية"
                value={employee.nationalId}
                name="nationalId"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="رقم الضمان الاجتماعي"
                value={employee.socialSecurityNumber}
                name="socialSecurityNumber"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="الجنس"
                value={employee.gender}
                name="gender"
                editing={editing}
                onChange={handleChange}
                selectOptions={["ذكر", "أنثى"]}
              />
              <InfoField
                label="الحالة الاجتماعية"
                value={employee.maritalStatus}
                name="maritalStatus"
                editing={editing}
                onChange={handleChange}
                selectOptions={["أعزب", "متزوج", "مطلق", "أرمل"]}
              />
              <InfoField
                label="تاريخ التوظيف"
                value={formatDate(employee.hireDate)}
                name="hireDate"
                type="date"
                editing={editing}
                onChange={handleChange}
              />
            </div>

            {/* العمود الثاني */}
            <div>
              <SectionTitle>معلومات الاتصال</SectionTitle>
              <InfoField
                label="البريد الإلكتروني"
                value={employee.email}
                name="email"
                type="email"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="رقم الهاتف"
                value={employee.phone}
                name="phone"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="العنوان"
                value={employee.address}
                name="address"
                editing={editing}
                onChange={handleChange}
                textarea
              />
              <InfoField
                label="الحساب البنكي"
                value={employee.bankAccount}
                name="bankAccount"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="جهة الاتصال للطوارئ"
                value={employee.emergencyContact}
                name="emergencyContact"
                editing={editing}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* قسم البدلات والخصومات والضمان الاجتماعي */}
          <div className="mt-8">
            <SectionTitle>البدلات والخصومات والضمان الاجتماعي</SectionTitle>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* البدلات */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-green-600 mb-4">البدلات</h4>
                  {allowances.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="text-right">
                          <th className="pb-2">النوع</th>
                          <th className="pb-2">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allowances.map((allowance, index) => (
                          <tr key={index} className="text-right border-t">
                            <td className="py-2">{allowance.type}</td>
                            <td className="py-2">
                              {allowance.amount?.toLocaleString() || 0} د.ع
                            </td>
                          </tr>
                        ))}
                        <tr className="text-right font-semibold border-t">
                          <td className="py-2">الإجمالي</td>
                          <td className="py-2">
                            {allowances
                              .reduce((sum, a) => sum + (a.amount || 0), 0)
                              .toLocaleString()}{" "}
                            د.ع{" "}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">لا توجد بدلات</p>
                  )}
                </div>

                {/* الخصومات */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-red-600 mb-4">الخصومات</h4>
                  {deductions.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="text-right">
                          <th className="pb-2">النوع</th>
                          <th className="pb-2">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deductions.map((deduction, index) => (
                          <tr key={index} className="text-right border-t">
                            <td className="py-2">{deduction.type}</td>
                            <td className="py-2">
                              {deduction.amount?.toLocaleString() || 0} ر.س
                            </td>
                          </tr>
                        ))}
                        <tr className="text-right font-semibold border-t">
                          <td className="py-2">الإجمالي</td>
                          <td className="py-2">
                            {deductions
                              .reduce((sum, d) => sum + (d.amount || 0), 0)
                              .toLocaleString()}{" "}
                            د.ع{" "}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">لا توجد خصومات</p>
                  )}
                </div>

                {/* الضمان الاجتماعي */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-4">
                    الضمان الاجتماعي
                  </h4>
                  {socialInsurance ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>المبلغ:</span>
                        <span>
                          {socialInsurance.amount?.toLocaleString() || 0} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>النسبة:</span>
                        <span>{socialInsurance.percentage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الحالة:</span>
                        <span>مسدد</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      لا توجد بيانات للضمان الاجتماعي
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* العمود الثالث */}
            <div>
              <SectionTitle>المعلومات الوظيفية</SectionTitle>
              <InfoField
                label="القسم"
                value={employee.department}
                name="department"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="المسمى الوظيفي"
                value={employee.jobTitle}
                name="jobTitle"
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="نوع العقد"
                value={employee.contractType}
                name="contractType"
                editing={editing}
                onChange={handleChange}
                selectOptions={["دوام كامل", "دوام جزئي", "مؤقت"]}
              />
              <InfoField
                label="الراتب"
                value={`${employee.salary.toLocaleString()} د.ع`}
                name="salary"
                type="number"
                editing={editing}
                onChange={handleChange}
              />
            </div>

            {/* العمود الرابع */}
            <div>
              <SectionTitle>رصيد الإجازات</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <LeaveBalanceCard
                  type="سنوية"
                  total={employee.leaveSettings?.سنوية || 21}
                  used={leaveSummary["سنوية"] || 0}
                />
                <LeaveBalanceCard
                  type="مرضية"
                  total={employee.leaveSettings?.مرضية || 30}
                  used={leaveSummary["مرضية"] || 0}
                />
                <LeaveBalanceCard
                  type="أمومة"
                  total={employee.leaveSettings?.أمومة || 60}
                  used={leaveSummary["أمومة"] || 0}
                />
                <LeaveBalanceCard
                  type="بدون راتب"
                  total={employee.leaveSettings?.بدون_راتب || 365}
                  used={leaveSummary["بدون راتب"] || 0}
                />
              </div>
            </div>
          </div>
          {/* معلومات إضافية */}
          <div className="mt-8">
            <SectionTitle>المؤهلات والخبرات</SectionTitle>
            <div className="bg-gray-50 p-4 rounded-lg">
              {editing ? (
                <textarea
                  name="qualifications"
                  value={formData.qualifications || ""}
                  onChange={handleChange}
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="أدخل المؤهلات والخبرات..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-line">
                  {employee.qualifications || "لا توجد معلومات متاحة"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/Notifications">
          <div className="relative bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition">
            <FaBell className="text-xl text-indigo-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

// مكونات مساعدة
const SectionTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-indigo-700 mb-4 pb-2 border-b border-indigo-200">
    {children}
  </h3>
);

const InfoField = ({
  label,
  value,
  name,
  editing,
  onChange,
  type = "text",
  textarea = false,
  selectOptions,
}) => (
  <div className="mb-4">
    <label className="block text-gray-600 mb-1">{label}</label>
    {editing ? (
      selectOptions ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded-md"
        >
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded-md"
          rows="3"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded-md"
        />
      )
    ) : (
      <p className="text-gray-800 font-medium">{value}</p>
    )}
  </div>
);

export default EmployeeInfo;
