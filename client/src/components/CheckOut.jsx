"use client";
import { useState, useEffect } from "react";
import {
  FaFingerprint,
  FaSignOutAlt,
  FaArrowLeft,
  FaUser,
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckOutPage() {
  const searchParams = useSearchParams();
  const fingerprintId = searchParams.get("fingerprintId");
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!fingerprintId) {
      router.push("/check-in");
      return;
    }

    const fetchData = async () => {
      try {
        // جلب بيانات الموظف
        const empRes = await fetch(
          `${apiUrl}/api/employees/fingerprint/${fingerprintId}`
        );
        if (!empRes.ok) throw new Error("الموظف غير مسجل");
        const empData = await empRes.json();
        setEmployee(empData.data);

        // جلب سجل الحضور اليوم
        const today = new Date().toISOString().split("T")[0];
        const attRes = await fetch(
          `${apiUrl}/api/attendance/daily?date=${today}&employeeId=${empData.data._id}`
        );

        if (!attRes.ok) throw new Error("فشل في جلب سجل الحضور");

        const attData = await attRes.json();
        if (attData.data && attData.data.length > 0) {
          setAttendanceToday(attData.data[0]);
        }
      } catch (error) {
        toast.error(error.message, {
          position: "top-center",
          rtl: true,
        });
      }
    };

    fetchData();
  }, [fingerprintId]);

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/attendance/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("تم تسجيل الانصراف بنجاح", {
          position: "top-center",
          rtl: true,
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push("/check-in");
        }, 2000);
      } else {
        throw new Error(data.message || "فشل في تسجيل الانصراف");
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        rtl: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWorkingHours = () => {
    if (!attendanceToday?.checkIn) return "00:00";

    const checkIn = new Date(attendanceToday.checkIn);
    const now = new Date();
    const diffMs = now - checkIn;
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    return `${diffHrs.toString().padStart(2, "0")}:${diffMins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-600 p-6 text-white text-center relative">
          <button
            onClick={() => router.push("/check-in")}
            className="absolute right-6 top-6 text-white hover:text-gray-200"
          >
            <FaArrowLeft />
          </button>

          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-500 bg-opacity-20">
            <FaSignOutAlt className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">تسجيل الانصراف</h2>
          <p className="mt-1 text-red-100">
            يرجى التأكد من معرف البصمة لتسجيل الانصراف
          </p>
        </div>

        <div className="p-6">
          {employee && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUser className="text-blue-600" />
                </div>
                <div className="mr-3">
                  <h4 className="font-medium">{employee.fullName}</h4>
                  <p className="text-sm text-gray-600">
                    {employee.department} - {employee.jobTitle}
                  </p>
                </div>
              </div>

              {attendanceToday?.checkIn && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-500">وقت الحضور</p>
                    <p className="font-medium">
                      {new Date(attendanceToday.checkIn).toLocaleTimeString(
                        "ar-EG"
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-500">ساعات العمل</p>
                    <p className="font-medium">{calculateWorkingHours()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCheckOut} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                معرف البصمة
              </label>
              <input
                type="text"
                value={fingerprintId || ""}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !employee}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-white font-medium ${
                isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? (
                "جاري التسجيل..."
              ) : (
                <>
                  <FaSignOutAlt className="ml-2" />
                  تسجيل الانصراف
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>شكراً لعملك اليوم، نتمنى لك راحة سعيدة</p>
          </div>
        </div>
      </div>
      {/* ToastContainer لعرض التنبيهات */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />{" "}
    </div>
  );
}
