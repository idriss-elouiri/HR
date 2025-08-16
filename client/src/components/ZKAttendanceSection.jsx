"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaUserClock, FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ZKAttendanceSection = () => {
  const [mode, setMode] = useState("checkIn"); // 'checkIn' أو 'checkOut'
  const [fingerprintId, setFingerprintId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const findEmployee = async () => {
    if (!fingerprintId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${apiUrl}/api/employees/fingerprint/${fingerprintId}`
      );

      if (!res.ok) throw new Error("لم يتم العثور على الموظف");

      const data = await res.json();
      setEmployee(data.data || null);
    } catch (error) {
      toast.error(error.message);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async () => {
    if (!fingerprintId || !employee) return;

    try {
      setLoading(true);
      const endpoint = mode === "checkIn" ? "check-in" : "check-out";
      const res = await fetch(`${apiUrl}/api/attendance/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintId, deviceId: "web-interface" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "فشل في عملية التسجيل");

      toast.success(data.message);
      fetchAttendanceRecords();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!employee) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${apiUrl}/api/attendance/daily?date=${
          selectedDate.toISOString().split("T")[0]
        }&employeeId=${employee._id}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "فشل في جلب السجلات");

      setAttendanceRecords(data.data || []);
    } catch (error) {
      toast.error(error.message);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fingerprintId) findEmployee();
  }, [fingerprintId]);

  useEffect(() => {
    if (employee) fetchAttendanceRecords();
  }, [employee, selectedDate]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mt-6">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <FaUserClock className="mr-2" /> نظام الحضور والانصراف بالبصمة
        </h2>
      </div>

      <div className="p-6">
        {/* واجهة تسجيل البصمة */}
        <div className="mb-8 bg-gray-50 p-6 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم معرف البصمة
              </label>
              <input
                type="text"
                value={fingerprintId}
                onChange={(e) => setFingerprintId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل رقم معرف البصمة"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("checkIn")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === "checkIn"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                حضور
              </button>
              <button
                onClick={() => setMode("checkOut")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === "checkOut"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                انصراف
              </button>
            </div>

            <button
              onClick={handleAttendance}
              disabled={!employee || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "جاري المعالجة..." : "تأكيد"}
            </button>
          </div>

          {employee && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg">
                {employee.fullName} - {employee.employeeId}
              </h3>
              <p className="text-gray-600">{employee.department}</p>
            </div>
          )}
        </div>

        {/* سجلات الحضور */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <FaHistory className="mr-2" /> سجل الحضور
            </h3>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="yyyy/MM/dd"
              className="px-3 py-1 border border-gray-300 rounded-lg"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              لا توجد سجلات لعرضها
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الحضور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الانصراف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ساعات العمل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString("ar-EG")
                          : "---"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString(
                              "ar-EG"
                            )
                          : "---"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workingHours.toFixed(2)} ساعة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            record.status === "حاضر"
                              ? "bg-green-100 text-green-800"
                              : record.status === "متأخر"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZKAttendanceSection;
