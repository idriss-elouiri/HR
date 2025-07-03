'use client';
import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody, Spinner } from "@nextui-org/react";
import MonthlyReport from '../components/MonthlyReport';
import AnnualReport from '../components/AnnualReport';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const currentYear = new Date().getFullYear();

  const fetchData = async (url) => {
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
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">التقارير والإشعارات</h1>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        className="mb-6"
        color="primary"
      >
        <Tab key="monthly" title="التقرير الشهري" />
        <Tab key="annual" title="التقرير السنوي" />
      </Tabs>

      <Card className="shadow-lg">
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="primary" />
              <span className="mr-2">جاري تحميل البيانات...</span>
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
                <AnnualReport
                  fetchData={fetchData}
                  apiUrl={apiUrl}
                  currentYear={currentYear}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">ملاحظات:</h3>
        <ul className="list-disc mr-4 text-blue-700 space-y-1">
          <li>التقارير تعتمد على البيانات المعتمدة فقط (حالة "موافق عليها")</li>
          <li>يتم تحديث البيانات تلقائياً عند تغيير الفلاتر</li>
          <li>يمكنك تصدير التقارير كملفات Excel أو PDF</li>
          <li>للتقرير السنوي، يمكنك النقر على السهم لرؤية التفاصيل</li>
        </ul>
      </div>

      <ToastContainer position="top-center" rtl={true} />
    </div>
  );
};

export default Reports;
