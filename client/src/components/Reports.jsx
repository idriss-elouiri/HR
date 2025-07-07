"use client"

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Card, CardBody, Spinner } from "@nextui-org/react";
import MonthlyReport from '../components/MonthlyReport';
import AnnualReport from '../components/AnnualReport';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChartLine, FaChartBar, FaFileExcel, FaFilePdf, FaInfoCircle } from 'react-icons/fa';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const currentYear = new Date().getFullYear();

  // إصلاح: استخدام useCallback لتثبيت مرجع الدالة
  const fetchData = useCallback(async (url) => {
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      return await response.json();
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []); // تبعيات فارغة لتثبيت الدالة

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            التقارير والإشعارات
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نظام متكامل لتقارير الغياب الشهرية والسنوية مع إمكانية التصدير والتحليل
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white overflow-hidden">
              <CardBody className="p-0">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  aria-label="التقارير"
                  classNames={{
                    tabList: "bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-0",
                    cursor: "bg-white",
                    tab: "h-16 text-white data-[selected=true]:text-indigo-600 font-medium"
                  }}
                >
                  <Tab
                    key="monthly"
                    title={
                      <div className="flex items-center gap-2 px-4">
                        <FaChartLine className="text-xl" />
                        <span>التقرير الشهري</span>
                      </div>
                    }
                  />
                  <Tab
                    key="annual"
                    title={
                      <div className="flex items-center gap-2 px-4">
                        <FaChartBar className="text-xl" />
                        <span>التقرير السنوي</span>
                      </div>
                    }
                  />
                </Tabs>

                <div className="p-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Spinner
                        size="lg"
                        classNames={{
                          circle1: "border-b-indigo-600",
                          circle2: "border-b-indigo-600",
                        }}
                      />
                      <span className="mt-4 text-lg text-gray-600 font-medium">جاري تحميل البيانات...</span>
                    </div>
                  ) : (
                    <>
                      {activeTab === "monthly" ? (
                        <MonthlyReport
                          fetchData={fetchData}
                          apiUrl={apiUrl}
                          currentYear={currentYear}
                        />
                      ) : (
                        // إصلاح: استبدال المكون الخطأ
                        <AnnualReport
                          fetchData={fetchData}
                          apiUrl={apiUrl}
                          currentYear={currentYear}
                        />
                      )}
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="w-full md:w-1/4">
            <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white overflow-hidden">
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <FaInfoCircle className="text-2xl" />
                  <h3 className="text-xl font-bold">ملاحظات هامة</h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                    <span>التقارير تعتمد على البيانات المعتمدة فقط (حالة "موافق عليها")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                    <span>يتم تحديث البيانات تلقائياً عند تغيير الفلاتر</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                    <span>يمكنك تصدير التقارير كملفات Excel أو PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                    <span>للتقرير السنوي، يمكنك النقر على السهم لرؤية التفاصيل</span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-white/30">
                  <h4 className="font-bold mb-3">تصدير التقارير</h4>
                  <div className="flex gap-3">
                    <button className="flex-1 flex flex-col items-center justify-center gap-1 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                      <FaFileExcel className="text-2xl" />
                      <span className="text-sm">Excel</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center gap-1 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                      <FaFilePdf className="text-2xl" />
                      <span className="text-sm">PDF</span>
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        rtl={true}
        toastClassName="font-sans"
        progressClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
      />
    </div>
  );
};

export default Reports;