import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 p-6">
      {/* العنوان الرئيسي */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 drop-shadow-lg">
          HR Management System
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-700">
          نظام الموارد البشرية الشامل
        </p>
      </div>

      {/* أزرار التسجيل */}
      <ul className="flex flex-col md:flex-row gap-6 mb-12">
        <li>
          <Link
            href="/AdminAuth"
            className="block w-64 text-center py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            تسجيل المسؤول
          </Link>
        </li>
        <li>
          <Link
            href="/EmployeesHrAuth"
            className="block w-64 text-center py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            تسجيل موظف HR
          </Link>
        </li>
        <li>
          <Link
            href="/EmployeesAuth"
            className="block w-64 text-center py-4 px-6 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            تسجيل الموظف
          </Link>
        </li>
      </ul>

      {/* زر تسجيل الحضور */}
      <div className="mt-6">
        <Link
          href="/check-in"
          className="inline-block py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition transform"
        >
          تسجيل الحضور والانصراف
        </Link>
      </div>
    </div>
  );
}
