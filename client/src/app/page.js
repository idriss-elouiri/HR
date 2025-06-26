import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-100 p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800">HR Management System</h1>
        <p className="mt-2 text-lg md:text-xl text-gray-600">نظام الموارد البشرية الشامل</p>
      </div>

      <ul className="flex flex-col md:flex-row gap-6">
        <li>
          <Link
            href="/AdminAuth"
            className="block w-64 text-center py-4 px-6 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            تسجيل المسؤول
          </Link>
        </li>
        <li>
          <Link
            href="/staffLogin"
            className="block w-64 text-center py-4 px-6 bg-green-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-green-700 transition"
          >
            تسجيل الموظف
          </Link>
        </li>
      </ul>
    </div>
  );
}