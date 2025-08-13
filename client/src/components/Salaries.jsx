"use client";

import { useState, useEffect } from "react";
import SalariesTable from "./SalariesTable";
import SalaryForm from "./SalaryForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSync, FaMoneyBillWave } from "react-icons/fa";
import AdvanceRequestsTable from "./AdvanceRequestsTable"; // جدول جديد لطلبات السلفة
import AdvanceRequestForm from "./AdvanceRequestForm"; // نموذج طلب سلفة

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [advanceRequests, setAdvanceRequests] = useState([]); // حالة لطلبات السلفة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [advanceFormOpen, setAdvanceFormOpen] = useState(false); // حالة لفتح نموذج السلفة
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/salaries`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("فشل في جلب البيانات");
      const data = await response.json();
      setSalaries(data.data || data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvanceRequests = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/advance-requests`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("فشل في جلب طلبات السلف");
      const data = await response.json();
      setAdvanceRequests(data.data || data || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchSalaries();
    fetchAdvanceRequests();
  }, []);

  const handleSubmitSuccess = () => {
    setFormOpen(false);
    fetchSalaries();
    toast.success(
      selectedSalary ? "تم تحديث بيانات الراتب" : "تم إضافة راتب جديد"
    );
  };

  const handleAdvanceSubmitSuccess = () => {
    setAdvanceFormOpen(false);
    fetchAdvanceRequests();
    toast.success("تم تقديم طلب السلفة بنجاح");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/salaries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("فشل في الحذف");

      toast.success("تم حذف سجل الراتب بنجاح");
      fetchSalaries();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAdvance = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/advance-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("فشل في حذف طلب السلف");

      toast.success("تم حذف طلب السلف بنجاح");
      fetchAdvanceRequests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateAdvanceRequest = async (id, status) => {
    try {
      const response = await fetch(`${apiUrl}/api/advance-requests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("فشل في تحديث طلب السلف");

      toast.success(`تم ${status} طلب السلف بنجاح`);
      fetchAdvanceRequests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            نظام إدارة الرواتب والسلف
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة رواتب الموظفين وطلبات السلف بكل سهولة ودقة
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-red-700 mb-2">حدث خطأ</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchSalaries();
                fetchAdvanceRequests();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto"
            >
              <FaSync className="ml-2" /> إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* قسم طلبات السلفة */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  طلبات السلفة
                </h2>
                <button
                  onClick={() => setAdvanceFormOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FaMoneyBillWave className="ml-2" /> طلب سلفة جديدة
                </button>
              </div>

              <AdvanceRequestsTable
                data={advanceRequests}
                onDelete={handleDeleteAdvance}
                onApprove={(id) => updateAdvanceRequest(id, "موافق عليها")}
                onReject={(id) => updateAdvanceRequest(id, "مرفوضة")}
                loading={loading}
              />
            </div>

            {/* قسم الرواتب */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SalariesTable
                data={salaries}
                onEdit={(salary) => {
                  setSelectedSalary(salary);
                  setSelectedEmployee(salary.employee);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
                onRefresh={() => {
                  fetchSalaries();
                  fetchAdvanceRequests();
                }}
                onAdd={() => {
                  setSelectedSalary(null);
                  setSelectedEmployee(null);
                  setFormOpen(true);
                }}
                apiUrl={apiUrl}
                loading={loading}
              />
            </div>
          </>
        )}

        {/* نافذة راتب */}
        {formOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-800">
                  {selectedSalary ? "تعديل راتب الموظف" : "إضافة راتب جديد"}
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <SalaryForm
                employee={selectedEmployee}
                salary={selectedSalary}
                onSuccess={handleSubmitSuccess}
                onCancel={() => setFormOpen(false)}
              />
            </motion.div>
          </div>
        )}

        {/* نافذة سلفة */}
        {advanceFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-800">
                  طلب سلفة جديدة
                </h2>
                <button
                  onClick={() => setAdvanceFormOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <AdvanceRequestForm
                onSuccess={handleAdvanceSubmitSuccess}
                onCancel={() => setAdvanceFormOpen(false)}
              />
            </motion.div>
          </div>
        )}

        <ToastContainer
          position="top-center"
          rtl={true}
          toastClassName="!bg-white !text-gray-800 !shadow-lg !rounded-xl !border !border-gray-200"
          progressClassName="!bg-gradient-to-r !from-blue-500 !to-indigo-600"
        />
      </motion.div>
    </div>
  );
};

export default Salaries;
