"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { signoutSuccess } from "../redux/user/userSlice"; // استيراد من ملف userSlice

const Logout = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const logout = async () => {
      try {
        // إرسال طلب تسجيل الخروج إلى الخادم
        const response = await fetch(`${apiUrl}/api/auth/logout`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          // تحديث حالة التخزين المحلي
          dispatch(signoutSuccess());

          // إعادة التوجيه إلى صفحة الدخول
          router.push("/");
        } else {
          console.error("فشل تسجيل الخروج:", await response.text());
          router.push("/");
        }
      } catch (error) {
        console.error("حدث خطأ أثناء تسجيل الخروج:", error);
        router.push("/");
      }
    };

    logout();
  }, [dispatch, router, apiUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg">جاري تسجيل الخروج...</p>
      </div>
    </div>
  );
};

export default Logout;
