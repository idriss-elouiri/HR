"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";

export default function HrAuth() {
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const res = await fetch(`${apiUrl}/api/employees/hr-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(signInFailure(data.message));
        throw new Error(data.message || "Login failed. Please try again.");
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        
        // توجيه موظف HR إلى لوحة التحكم
        router.push("/Dashboard");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">تسجيل دخول الموارد البشرية</h2>
          <p className="text-gray-600 mt-2">الدخول إلى لوحة تحكم الموارد البشرية</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* fullName Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              الاسم الكامل
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          {/* email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>

            {/* Error Message */}
            {errorMessage && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg" id="error-message">
                {errorMessage}
              </p>
            )}
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            هل تواجه مشكلة في الدخول؟{' '}
            <Link href="/contact" className="text-purple-600 hover:underline">
              اتصل بالدعم الفني
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}