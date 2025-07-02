// src/pages/Reports.js
'use client';
import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody, CardHeader } from "@nextui-org/react";
import MonthlyReport from '../components/MonthlyReport';
import AnnualReport from '../components/AnnualReport';
import Notifications from '../components/Notifications';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChartBar, FaBell, FaCalendarAlt } from 'react-icons/fa';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [monthlyData, setMonthlyData] = useState([]);
  const [annualData, setAnnualData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات التقارير الشهرية
        if (activeTab === "monthly") {
          const response = await fetch(`${apiUrl}/api/reports/monthly`);
          const data = await response.json();
          setMonthlyData(data.data);
        }
        
        // جلب بيانات التقارير السنوية
        if (activeTab === "annual") {
          const response = await fetch(`${apiUrl}/api/reports/annual`);
          const data = await response.json();
          setAnnualData(data.data);
        }
        
        // جلب الإشعارات
        if (activeTab === "notifications") {
          const response = await fetch(`${apiUrl}/api/notifications`);
          const data = await response.json();
          setNotifications(data.data);
        }
      } catch (err) {
        toast.error('فشل في جلب البيانات');
      }
    };
    
    fetchData();
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">التقارير والإشعارات</h1>
      
      <Tabs 
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        className="mb-6"
      >
        <Tab 
          key="monthly" 
          title={
            <div className="flex items-center gap-2">
              <FaCalendarAlt /> تقارير شهرية
            </div>
          } 
        />
        <Tab 
          key="annual" 
          title={
            <div className="flex items-center gap-2">
              <FaChartBar /> تقارير سنوية
            </div>
          } 
        />
        <Tab 
          key="notifications" 
          title={
            <div className="flex items-center gap-2">
              <FaBell /> الإشعارات
            </div>
          } 
        />
      </Tabs>
      
      <Card>
        <CardBody>
          {activeTab === "monthly" && (
            <MonthlyReport data={monthlyData} />
          )}
          
          {activeTab === "annual" && (
            <AnnualReport data={annualData} />
          )}
          
          {activeTab === "notifications" && (
            <Notifications data={notifications} />
          )}
        </CardBody>
      </Card>
      
      <ToastContainer position="top-center" rtl={true} />
    </div>
  );
};

export default Reports;