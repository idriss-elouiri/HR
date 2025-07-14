"use client"

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Card, CardBody, Spinner, Button, Select, SelectItem } from "@nextui-org/react";
import MonthlyReport from '../components/MonthlyReport';
import AnnualReport from '../components/AnnualReport';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChartLine, FaChartBar, FaCrown } from 'react-icons/fa';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const currentYear = new Date().getFullYear();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabData, setTabData] = useState({
    monthly: null,
    annual: null
  });

  // دالة موحدة لجلب البيانات
  const fetchData = useCallback(async (url, type) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`فشل في جلب البيانات: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('فشل في تحميل البيانات من الخادم');
      }

      setTabData(prev => ({ ...prev, [type]: result.data }));
      return result.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'حدث خطأ في جلب البيانات');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // جلب البيانات عند تغيير التبويب
  useEffect(() => {
    if (activeTab === "monthly") {
      if (!tabData.monthly) {
        fetchData(
          `${apiUrl}/api/reports/monthly?month=${new Date().getMonth() + 1}&year=${currentYear}`,
          'monthly'
        );
      }
    } else {
      if (!tabData.annual) {
        fetchData(
          `${apiUrl}/api/reports/annual/${currentYear}`,
          'annual'
        );
      }
    }
  }, [activeTab, tabData, fetchData, apiUrl, currentYear]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 relative">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
            <FaCrown className="text-white text-xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-800 mb-3">
            التقارير والإشعارات
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نظام متكامل لمتابعة أداء الموظفين وتحليل البيانات الشهرية والسنوية
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardBody className="p-0 overflow-hidden">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              aria-label="التقارير"
              classNames={{
                tabList: "bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-t-2xl",
                cursor: "bg-white shadow-lg",
                tab: "text-white data-[hover=true]:text-indigo-100",
                tabContent: "group-data-[selected=true]:text-indigo-700 font-medium"
              }}
            >
              <Tab
                key="monthly"
                title={
                  <div className="flex items-center gap-2 px-4 py-3">
                    <FaChartLine className="text-lg" />
                    <span>التقرير الشهري</span>
                  </div>
                }
              />
              <Tab
                key="annual"
                title={
                  <div className="flex items-center gap-2 px-4 py-3">
                    <FaChartBar className="text-lg" />
                    <span>التقرير السنوي</span>
                  </div>
                }
              />
            </Tabs>

            <div className="p-4 md:p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner size="lg" color="secondary" />
                  <span className="mt-4 text-indigo-700 font-medium">
                    جاري تحميل البيانات...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-10 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                  <h3 className="text-lg font-medium text-red-800 mb-2">حدث خطأ</h3>
                  <p className="mb-6 text-red-700 max-w-md mx-auto">{error}</p>
                  <Button
                    color="primary"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => {
                      if (activeTab === "monthly") {
                        fetchData(
                          `${apiUrl}/api/reports/monthly?month=${new Date().getMonth() + 1}&year=${currentYear}`,
                          'monthly'
                        );
                      } else {
                        fetchData(
                          `${apiUrl}/api/reports/annual/${currentYear}`,
                          'annual'
                        );
                      }
                    }}
                  >
                    المحاولة مرة أخرى
                  </Button>
                </div>
              ) : (
                <>
                  {activeTab === "monthly" ? (
                    <MonthlyReport
                      data={tabData.monthly}
                      apiUrl={apiUrl}
                      currentYear={currentYear}
                      fetchData={fetchData}
                    />
                  ) : (
                    <AnnualReport
                      data={tabData.annual}
                      apiUrl={apiUrl}
                      currentYear={currentYear}
                      fetchData={fetchData}
                    />
                  )}
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <ToastContainer
        position="top-center"
        rtl={true}
        toastClassName="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
        progressClassName="bg-gradient-to-r from-indigo-400 to-purple-500"
      />
    </div>
  );
};

export default Reports;