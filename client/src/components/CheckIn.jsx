"use client";
import { useState } from "react";
import { FaFingerprint, FaCheckCircle, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckInPage() {
  const [fingerprintId, setFingerprintId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const verifyEmployee = async () => {
    if (!fingerprintId) {
      toast.error("يرجى إدخال معرف البصمة", {
        position: "top-center",
        rtl: true,
      });
      return false;
    }

    try {
      const res = await fetch(
        `${apiUrl}/api/employees/fingerprint/${fingerprintId}`
      );
      if (!res.ok) throw new Error("الموظف غير مسجل");
      const data = await res.json();
      setEmployee(data.data);
      return true;
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        rtl: true,
      });
      return false;
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await verifyEmployee();
      if (!isValid) return;

      const response = await fetch(`${apiUrl}/api/attendance/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprintId,
          deviceId: "web-interface",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("تم تسجيل الحضور بنجاح", {
          position: "top-center",
          rtl: true,
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push(`/check-out?fingerprintId=${fingerprintId}`);
        }, 2000);
      } else {
        throw new Error(data.message || "فشل في تسجيل الحضور");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      {/* مكون ToastContainer يجب إضافته مرة واحدة في التطبيق */}
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
      />

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-500 bg-opacity-20">
            <FaFingerprint className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">تسجيل الحضور</h2>
          <p className="mt-1 text-blue-100">
            يرجى إدخال معرف البصمة لتسجيل الحضور
          </p>
        </div>

        <div className="p-6">
          {employee && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUser className="text-green-600" />
              </div>
              <div className="mr-3">
                <h4 className="font-medium">{employee.fullName}</h4>
                <p className="text-sm text-gray-600">
                  {employee.department} - {employee.jobTitle}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                معرف البصمة
              </label>
              <input
                type="text"
                value={fingerprintId}
                onChange={(e) => setFingerprintId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل رقم معرف البصمة"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-white font-medium ${
                isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                "جاري التسجيل..."
              ) : (
                <>
                  <FaCheckCircle className="ml-2" />
                  تسجيل الحضور
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>إذا كنت تواجه مشكلة في التسجيل، يرجى الاتصال بالدعم الفني</p>
          </div>
        </div>
      </div>
    </div>
  );
}
