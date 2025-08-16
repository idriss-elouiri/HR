'use client'

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Card, CardBody, Spinner, Button, Select, SelectItem } from "@nextui-org/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChartLine, FaChartBar, FaCrown, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { MdOutlineEmojiEvents, MdBarChart } from 'react-icons/md';

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

  // بيانات وهمية للعرض (في حالة عدم توفر بيانات)
  const mockMonthlyData = {
    revenue: "1,250,000",
    growth: "+15%",
    topEmployee: {
      name: "أحمد محمد",
      position: "مدير مبيعات",
      sales: "350,000"
    },
    metrics: [
      { title: "إجمالي المبيعات", value: "1,250,000", change: "+15%", icon: <FaMoneyBillWave /> },
      { title: "المشاريع المكتملة", value: "24", change: "+20%", icon: <MdOutlineEmojiEvents /> },
      { title: "العملاء الجدد", value: "38", change: "+12%", icon: <FaCrown /> },
      { title: "متوسط المبيعات", value: "52,083", change: "+8%", icon: <MdBarChart /> }
    ]
  };

  const mockAnnualData = {
    revenue: "14,800,000",
    growth: "+22%",
    topDepartment: {
      name: "قسم المبيعات",
      revenue: "8,200,000",
      growth: "+28%"
    },
    metrics: [
      { title: "إجمالي المبيعات السنوي", value: "14,800,000", change: "+22%", icon: <FaMoneyBillWave /> },
      { title: "المشاريع السنوية", value: "312", change: "+18%", icon: <MdOutlineEmojiEvents /> },
      { title: "العملاء الدائمين", value: "142", change: "+15%", icon: <FaCrown /> },
      { title: "نمو الربحية", value: "31%", change: "+9%", icon: <MdBarChart /> }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 relative">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-800 rounded-full animate-pulse"></div>
            <FaCrown className="text-white text-xl relative z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-800 mb-3">
            التقارير والإشعارات
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نظام متكامل لمتابعة أداء الموظفين وتحليل البيانات الشهرية والسنوية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">1,250,000</h3>
                <p className="text-purple-200">إجمالي المبيعات</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">+15%</span>
              <span className="text-purple-200 text-sm mr-2">مقارنة بالشهر الماضي</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">24</h3>
                <p className="text-pink-200">المشاريع المكتملة</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <MdOutlineEmojiEvents className="text-2xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">+20%</span>
              <span className="text-pink-200 text-sm mr-2">مقارنة بالشهر الماضي</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">38</h3>
                <p className="text-amber-200">العملاء الجدد</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FaCrown className="text-2xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">+12%</span>
              <span className="text-amber-200 text-sm mr-2">مقارنة بالشهر الماضي</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">52,083</h3>
                <p className="text-cyan-200">متوسط المبيعات</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <MdBarChart className="text-2xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">+8%</span>
              <span className="text-cyan-200 text-sm mr-2">مقارنة بالشهر الماضي</span>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl shadow-xl border border-white bg-gradient-to-br from-white to-indigo-50 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500"></div>
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
                  <Spinner size="lg" classNames={{
                    circle1: "border-b-purple-600",
                    circle2: "border-b-purple-600",
                  }} />
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">
                        {activeTab === "monthly" ? "مخطط المبيعات الشهري" : "مخطط المبيعات السنوي"}
                      </h2>
                      <Select 
                        size="sm"
                        label="الفترة الزمنية"
                        className="max-w-[180px]"
                        defaultSelectedKeys={["current"]}
                      >
                        <SelectItem key="current" value="current">
                          الحالية
                        </SelectItem>
                        <SelectItem key="previous" value="previous">
                          السابقة
                        </SelectItem>
                        <SelectItem key="custom" value="custom">
                          مخصصة
                        </SelectItem>
                      </Select>
                    </div>
                    
                    <div className="relative h-64 bg-gradient-to-b from-indigo-50 to-white rounded-xl p-4">
                      <div className="flex h-full items-end gap-2">
                        {[65, 80, 60, 75, 90, 85, 95, 70, 65, 80, 75, 90].map((height, index) => (
                          <div 
                            key={index}
                            className="flex-1 flex flex-col items-center"
                          >
                            <div 
                              className="w-full rounded-t-md transition-all duration-500 hover:opacity-90"
                              style={{
                                height: `${height}%`,
                                background: index % 3 === 0 
                                  ? 'linear-gradient(to top, #7e22ce, #a855f7)' 
                                  : index % 3 === 1 
                                    ? 'linear-gradient(to top, #6366f1, #818cf8)' 
                                    : 'linear-gradient(to top, #ec4899, #f472b6)'
                              }}
                            ></div>
                            <span className="text-xs text-gray-500 mt-2">
                              {activeTab === "monthly" 
                                ? `شهر ${index+1}` 
                                : `ربع ${index+1}`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-indigo-100 to-transparent"></div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center mr-6">
                        <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                        <span className="text-sm text-gray-600">المبيعات</span>
                      </div>
                      <div className="flex items-center mr-6">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                        <span className="text-sm text-gray-600">الإيرادات</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                        <span className="text-sm text-gray-600">الأهداف</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      {activeTab === "monthly" ? "أفضل الموظفين" : "أفضل الأقسام"}
                    </h2>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 mb-6">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl">
                          1
                        </div>
                        <div className="mr-4">
                          <h3 className="font-bold text-gray-800">
                            {activeTab === "monthly" ? mockMonthlyData.topEmployee.name : mockAnnualData.topDepartment.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activeTab === "monthly" 
                              ? mockMonthlyData.topEmployee.position 
                              : "أعلى إيرادات"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                          <p className="font-bold text-lg">
                            {activeTab === "monthly" 
                              ? mockMonthlyData.topEmployee.sales 
                              : mockAnnualData.topDepartment.revenue}
                          </p>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {activeTab === "monthly" 
                            ? mockMonthlyData.growth 
                            : mockAnnualData.topDepartment.growth}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[2, 3, 4].map((rank) => (
                        <div key={rank} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-gray-200 w-8 h-8 rounded-lg flex items-center justify-center text-gray-700">
                              {rank}
                            </div>
                            <div className="mr-3">
                              <h4 className="font-medium text-gray-800">
                                {activeTab === "monthly" ? `موظف ${rank}` : `قسم ${rank}`}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {activeTab === "monthly" ? "منصب الموظف" : "نوع القسم"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              {activeTab === "monthly" 
                                ? `${Math.floor(Math.random() * 200 + 200)},000` 
                                : `${Math.floor(Math.random() * 5 + 3)},000,000`}
                            </p>
                            <p className="text-xs text-green-600">
                              +{Math.floor(Math.random() * 15 + 5)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      مؤشرات الأداء الرئيسية
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(activeTab === "monthly" ? mockMonthlyData.metrics : mockAnnualData.metrics).map((metric, index) => (
                        <div 
                          key={index}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center mb-3">
                            <div className={`p-2 rounded-lg ${
                              index === 0 ? 'bg-purple-100 text-purple-600' :
                              index === 1 ? 'bg-pink-100 text-pink-600' :
                              index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'
                            }`}>
                              {metric.icon}
                            </div>
                            <h3 className="mr-3 font-medium text-gray-800">{metric.title}</h3>
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {metric.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div>
            <h3 className="text-xl font-bold">هل تحتاج إلى تقارير متقدمة؟</h3>
            <p className="text-indigo-200 mt-1">يمكننا توفير تقارير مفصلة حسب متطلباتك</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0 bg-white text-indigo-700 font-medium hover:bg-indigo-50"
          >
            طلب تقرير مخصص
          </Button>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        rtl={true}
        toastClassName="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-lg"
        progressClassName="bg-gradient-to-r from-indigo-400 to-purple-500"
      />
    </div>
  );
};

export default Reports;