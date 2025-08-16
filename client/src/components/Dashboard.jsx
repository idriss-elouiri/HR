"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Button,
  Badge,
  Progress,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Tooltip
} from "@nextui-org/react";
import {
  FaUsers,
  FaCalendarTimes,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaChartLine,
  FaUserClock,
  FaFileExcel,
  FaFilePdf,
  FaEllipsisV,
  FaCrown,
} from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { TbChartBar, TbChartArea, TbChartPie, TbChartDonut } from "react-icons/tb";
import moment from "moment";
import "moment/locale/ar";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMonth] = useState(moment().format("MMMM YYYY"));
  const [error, setError] = useState(null);
  const [activeEmployeesExpanded, setActiveEmployeesExpanded] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/dashboard`);

        if (!response.ok) {
          throw new Error("فشل في جلب بيانات لوحة التحكم");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("فشل في جلب بيانات لوحة التحكم:", error);
        setError("حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ar-EG").format(num);
  };

  const formatDate = (dateString) => {
    return moment(dateString).locale("ar").format("DD MMMM YYYY");
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#0f0f18]/80 backdrop-blur-xl border border-[#2a2a4a] shadow-2xl">
          <Spinner 
            size="lg" 
            classNames={{
              circle1: "border-b-[#c9a227]",
              circle2: "border-b-[#c9a227]",
              wrapper: "text-[#c9a227]"
            }} 
          />
          <span className="mt-4 text-lg text-[#d4c690] font-medium tracking-wide">
            جاري تحميل بيانات لوحة التحكم...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
        <div className="bg-gradient-to-r from-[#a52a2a]/70 to-[#8b0000]/70 p-8 rounded-3xl text-center max-w-md backdrop-blur-xl border border-[#8b0000] shadow-2xl">
          <div className="bg-[#ff0000]/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#ff6b6b]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#ffcccc] mb-3">حدث خطأ</h2>
          <p className="text-[#ffb6b6] mb-6">{error}</p>
          <Button
            className="bg-gradient-to-r from-[#c9a227] to-[#b88d20] text-[#fff9e6] font-bold shadow-lg hover:scale-[1.02] transition-transform"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] p-4 md:p-8">
      {/* شريط الذهبي الزخرفي في الأعلى */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a227] via-[#b88d20] to-[#c9a227] z-10"></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* شعار فاخر */}
        <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-2 z-10">
          <FaCrown className="text-[#c9a227] text-xl" />
          <span className="text-[#d4c690] font-bold text-sm tracking-wider">PREMIUM EDITION</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-6">
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4c690] to-[#c9a227] tracking-wide">
              لوحة التحكم الذكية
            </h1>
            <p className="text-[#a0a0b0] mt-2 text-sm md:text-base">
              نظرة عامة على إحصائيات النظام والأنشطة الحديثة - {currentMonth}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Tooltip content="تصدير إلى PDF" color="foreground" className="bg-[#1a1a2e] text-[#d4c690]">
              <Button isIconOnly variant="flat" className="bg-[#1a1a2e]/50 border border-[#2a2a4a] text-[#d4c690] hover:bg-[#2a2a4a]">
                <FaFilePdf />
              </Button>
            </Tooltip>
            <Tooltip content="تصدير إلى Excel" color="foreground" className="bg-[#1a1a2e] text-[#d4c690]">
              <Button isIconOnly variant="flat" className="bg-[#1a1a2e]/50 border border-[#2a2a4a] text-[#d4c690] hover:bg-[#2a2a4a]">
                <FaFileExcel />
              </Button>
            </Tooltip>
          </div>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          color="primary"
          variant="solid"
          className="mb-6"
          classNames={{
            tab: "text-base font-medium px-5 py-3 text-[#d4c690]",
            tabContent: "group-data-[selected=true]:text-[#0a0a0a]",
            cursor: "bg-gradient-to-r from-[#c9a227] to-[#b88d20]",
          }}
        >
          <Tab key="overview" title="نظرة عامة" />
          <Tab key="analytics" title="التحليلات" />
          <Tab key="reports" title="التقارير" />
        </Tabs>

        {activeTab === "overview" ? (
          <>
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="عدد الموظفين"
                value={dashboardData?.employeesCount || 0}
                icon={<FaUsers className="text-2xl text-[#8bb9fe]" />}
                color="from-[#1e3a8a]/70 to-[#3b82f6]/70"
                change={dashboardData?.employeesChange || 0}
              />

              <StatCard
                title="الغيابات اليوم"
                value={dashboardData?.todayAbsences || 0}
                icon={<FaCalendarTimes className="text-2xl text-[#fca5a5]" />}
                color="from-[#7f1d1d]/70 to-[#ef4444]/70"
                change={dashboardData?.absencesChange || 0}
              />

              <StatCard
                title="الإجازات المعتمدة"
                value={dashboardData?.approvedLeaves || 0}
                icon={<FaCalendarCheck className="text-2xl text-[#86efac]" />}
                color="from-[#14532d]/70 to-[#22c55e]/70"
                change={dashboardData?.leavesChange || 0}
              />

              <StatCard
                title="مجموع الرواتب"
                value={`${formatNumber(dashboardData?.monthlySalaries || 0)} د.ع`}
                icon={<FaMoneyBillWave className="text-2xl text-[#fde68a]" />}
                color="from-[#854d0e]/70 to-[#eab308]/70"
                change={dashboardData?.salariesChange || 0}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* الموظفون النشطون */}
              <Card className="rounded-2xl shadow-xl border border-[#2a2a4a] bg-[#0f0f18]/70 backdrop-blur-xl">
                <CardHeader className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <FaUserClock className="text-[#8bb9fe] text-xl" />
                    <h2 className="text-xl font-semibold text-[#d4c690]">
                      الموظفون النشطون اليوم
                    </h2>
                  </div>
                  <Badge
                    color="primary"
                    content={dashboardData?.activeEmployees?.length || 0}
                    size="lg"
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white"
                  />
                </CardHeader>
                <Divider className="bg-[#2a2a4a]" />
                <CardBody className="p-0">
                  <div className={`overflow-y-auto transition-all duration-500 ${activeEmployeesExpanded ? 'max-h-[800px]' : 'max-h-96'}`}>
                    {dashboardData?.activeEmployees?.length > 0 ? (
                      dashboardData.activeEmployees.map((employee) => (
                        <div
                          key={employee._id}
                          className="p-4 border-b border-[#2a2a4a] last:border-0 hover:bg-[#1a1a2e]/50 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar
                                showFallback
                                name={employee.name}
                                className="w-16 h-16 text-lg bg-gradient-to-r from-[#3b82f6] to-[#8bb9fe] group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#22c55e] to-[#86efac] border-2 border-[#0f0f18] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-[#d4c690] group-hover:text-[#c9a227] transition-colors">
                                    {employee.name}
                                  </h3>
                                  <p className="text-[#8bb9fe] text-sm">
                                    {employee.position}
                                  </p>
                                </div>
                                <Chip
                                  className="bg-gradient-to-r from-[#22c55e] to-[#86efac] text-[#0a0a0a]"
                                  size="sm"
                                >
                                  {employee.status}
                                </Chip>
                              </div>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Chip
                                  variant="flat"
                                  className="bg-[#1a1a2e] text-[#8bb9fe] border border-[#2a2a4a]"
                                  size="sm"
                                  startContent={
                                    <span className="text-xs text-[#8bb9fe]">
                                      القسم:
                                    </span>
                                  }
                                >
                                  {employee.department}
                                </Chip>
                                <Chip
                                  variant="flat"
                                  className="bg-[#1a1a2e] text-[#d4c690] border border-[#2a2a4a]"
                                  size="sm"
                                  startContent={
                                    <span className="text-xs text-[#d4c690]">
                                      الوردية:
                                    </span>
                                  }
                                >
                                  {employee.schedule}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a0a0b0]">
                        <FaUserClock className="mx-auto text-3xl text-[#3b82f6]/30 mb-3" />
                        <p>لا يوجد موظفون نشطون حالياً</p>
                      </div>
                    )}
                  </div>
                  {dashboardData?.activeEmployees?.length > 3 && (
                    <div className="p-4 flex justify-center">
                      <Button 
                        variant="flat" 
                        className="bg-[#1a1a2e] text-[#d4c690] border border-[#2a2a4a]"
                        onClick={() => setActiveEmployeesExpanded(!activeEmployeesExpanded)}
                      >
                        {activeEmployeesExpanded ? "عرض أقل" : "عرض المزيد"}
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* الإجازات القادمة */}
              <Card className="rounded-2xl shadow-xl border border-[#2a2a4a] bg-[#0f0f18]/70 backdrop-blur-xl">
                <CardHeader className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarCheck className="text-[#86efac] text-xl" />
                    <h2 className="text-xl font-semibold text-[#d4c690]">
                      الإجازات القادمة
                    </h2>
                  </div>
                  <Badge
                    className="bg-gradient-to-r from-[#14532d] to-[#22c55e] text-white"
                    content={dashboardData?.upcomingLeaves?.length || 0}
                    size="lg"
                  />
                </CardHeader>
                <Divider className="bg-[#2a2a4a]" />
                <CardBody className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {dashboardData?.upcomingLeaves?.length > 0 ? (
                      dashboardData.upcomingLeaves.map((leave, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-[#2a2a4a] last:border-0 hover:bg-[#1a1a2e]/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-[#d4c690]">
                                {leave.name || "موظف غير معروف"}{" "}
                              </h3>
                              <p className="text-[#86efac] text-sm">
                                {leave.detail}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#86efac]">
                                {formatDate(leave.date)}
                              </p>
                              <Chip
                                className="mt-1 bg-gradient-to-r from-[#22c55e] to-[#86efac] text-[#0a0a0a]"
                                size="sm"
                              >
                                {leave.status}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a0a0b0]">
                        <FaCalendarCheck className="mx-auto text-3xl text-[#22c55e]/30 mb-3" />
                        <p>لا توجد إجازات قادمة</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* طلبات الغياب الأخيرة */}
              <Card className="rounded-2xl shadow-xl border border-[#2a2a4a] bg-[#0f0f18]/70 backdrop-blur-xl">
                <CardHeader className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarTimes className="text-[#fca5a5] text-xl" />
                    <h2 className="text-xl font-semibold text-[#d4c690]">
                      طلبات الغياب الأخيرة
                    </h2>
                  </div>
                  <Badge
                    className="bg-gradient-to-r from-[#7f1d1d] to-[#ef4444] text-white"
                    content={dashboardData?.recentAbsences?.length || 0}
                    size="lg"
                  />
                </CardHeader>
                <Divider className="bg-[#2a2a4a]" />
                <CardBody className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {dashboardData?.recentAbsences?.length > 0 ? (
                      dashboardData.recentAbsences.map((absence, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-[#2a2a4a] last:border-0 hover:bg-[#1a1a2e]/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-[#d4c690]">
                                {absence.name}
                              </h3>
                              <p className="text-[#fca5a5] text-sm">
                                {absence.detail}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#fca5a5]">
                                {formatDate(absence.date)}
                              </p>
                              <Chip
                                className={`mt-1 ${
                                  absence.status === "موافق عليها"
                                    ? "bg-gradient-to-r from-[#22c55e] to-[#86efac]"
                                    : "bg-gradient-to-r from-[#eab308] to-[#fde68a] text-[#0a0a0a]"
                                }`}
                                size="sm"
                              >
                                {absence.status}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a0a0b0]">
                        <FaCalendarTimes className="mx-auto text-3xl text-[#ef4444]/30 mb-3" />
                        <p>لا توجد طلبات غياب حديثة</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* الرواتب المستحقة */}
              <Card className="rounded-2xl shadow-xl border border-[#2a2a4a] bg-[#0f0f18]/70 backdrop-blur-xl">
                <CardHeader className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-[#fde68a] text-xl" />
                    <h2 className="text-xl font-semibold text-[#d4c690]">
                      الرواتب المستحقة
                    </h2>
                  </div>
                  <Badge
                    className="bg-gradient-to-r from-[#854d0e] to-[#eab308] text-white"
                    content={dashboardData?.pendingSalaries?.length || 0}
                    size="lg"
                  />
                </CardHeader>
                <Divider className="bg-[#2a2a4a]" />
                <CardBody className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {dashboardData?.pendingSalaries?.length > 0 ? (
                      dashboardData.pendingSalaries.map((salary, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-[#2a2a4a] last:border-0 hover:bg-[#1a1a2e]/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-[#d4c690]">
                                {salary.name}
                              </h3>
                              <p className="text-[#fde68a] text-sm">
                                {salary.detail}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#fde68a]">
                                {salary.date}
                              </p>
                              <Chip
                                className="mt-1 bg-gradient-to-r from-[#eab308] to-[#fde68a] text-[#0a0a0a]"
                                size="sm"
                              >
                                {salary.status}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a0a0b0]">
                        <FaMoneyBillWave className="mx-auto text-3xl text-[#eab308]/30 mb-3" />
                        <p>لا توجد رواتب مستحقة</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* معدل الغياب الشهري */}
            <Card className="rounded-2xl shadow-xl p-6 bg-[#0f0f18]/70 backdrop-blur-xl border border-[#2a2a4a]">
              <CardHeader className="flex items-center justify-between p-0 mb-6">
                <div className="flex items-center gap-2">
                  <TbChartBar className="text-[#fca5a5] text-xl" />
                  <h2 className="text-xl font-semibold text-[#d4c690]">
                    معدل الغياب الشهري
                  </h2>
                </div>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-[#1a1a2e] text-[#fca5a5]"
                >
                  <FaEllipsisV />
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <div className="space-y-6">
                  {dashboardData?.absenceTrend?.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#a0a0b0]">{item.label}</span>
                        <span className="font-medium text-[#fca5a5]">
                          {item.value} حالة
                        </span>
                      </div>
                      <Progress
                        size="sm"
                        value={item.percentage}
                        classNames={{
                          indicator: "bg-gradient-to-r from-[#7f1d1d] to-[#ef4444]",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* توزيع الإجازات */}
            <Card className="rounded-2xl shadow-xl p-6 bg-[#0f0f18]/70 backdrop-blur-xl border border-[#2a2a4a]">
              <CardHeader className="flex items-center justify-between p-0 mb-6">
                <div className="flex items-center gap-2">
                  <TbChartPie className="text-[#86efac] text-xl" />
                  <h2 className="text-xl font-semibold text-[#d4c690]">
                    توزيع الإجازات
                  </h2>
                </div>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-[#1a1a2e] text-[#86efac]"
                >
                  <FaEllipsisV />
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <div className="space-y-6">
                  {dashboardData?.leaveDistribution?.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#a0a0b0]">{item.label}</span>
                        <span className="font-medium text-[#86efac]">
                          {item.value} إجازة
                        </span>
                      </div>
                      <Progress
                        size="sm"
                        value={item.percentage}
                        classNames={{
                          indicator: "bg-gradient-to-r from-[#14532d] to-[#22c55e]",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* الراتب الشهري */}
            <Card className="rounded-2xl shadow-xl p-6 bg-[#0f0f18]/70 backdrop-blur-xl border border-[#2a2a4a]">
              <CardHeader className="flex items-center justify-between p-0 mb-6">
                <div className="flex items-center gap-2">
                  <TbChartArea className="text-[#fde68a] text-xl" />
                  <h2 className="text-xl font-semibold text-[#d4c690]">
                    الراتب الشهري
                  </h2>
                </div>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-[#1a1a2e] text-[#fde68a]"
                >
                  <FaEllipsisV />
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <div className="bg-gradient-to-r from-[#c9a227]/80 to-[#b88d20]/80 text-[#fff9e6] p-6 rounded-xl mb-6 shadow-lg shadow-[#c9a227]/20">
                  <div className="text-center">
                    <p className="text-lg">إجمالي الرواتب الشهرية</p>
                    <p className="text-3xl font-bold mt-2">
                      {formatNumber(dashboardData?.monthlySalaries || 0)} د.ع
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#1e3a8a]/70 to-[#3b82f6]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#8bb9fe]">الزيادة عن الشهر الماضي</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.salariesChange || 0}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#14532d]/70 to-[#22c55e]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#86efac]">عدد الموظفين المستحقين</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.employeesCount || 0}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* إحصائيات الموظفين */}
            <Card className="rounded-2xl shadow-xl p-6 bg-[#0f0f18]/70 backdrop-blur-xl border border-[#2a2a4a]">
              <CardHeader className="flex items-center justify-between p-0 mb-6">
                <div className="flex items-center gap-2">
                  <TbChartDonut className="text-[#8bb9fe] text-xl" />
                  <h2 className="text-xl font-semibold text-[#d4c690]">
                    إحصائيات الموظفين
                  </h2>
                </div>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-[#1a1a2e] text-[#8bb9fe]"
                >
                  <FaEllipsisV />
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#1e3a8a]/70 to-[#3b82f6]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#8bb9fe]">الزيادة عن الشهر الماضي</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.employeesChange || 0}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#14532d]/70 to-[#22c55e]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#86efac]">الموظفون النشطون</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.activeEmployees?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#854d0e]/70 to-[#eab308]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#fde68a]">في إجازة</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.approvedLeaves || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#7f1d1d]/70 to-[#ef4444]/70 p-4 rounded-xl border border-[#2a2a4a]">
                    <p className="text-[#fca5a5]">غائبون اليوم</p>
                    <p className="text-xl font-bold text-[#d4c690]">
                      {dashboardData?.todayAbsences || 0}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
      
      {/* تذييل فاخر */}
      <footer className="mt-12 pt-8 pb-4 border-t border-[#2a2a4a] text-center text-[#a0a0b0] text-sm">
        <div className="max-w-7xl mx-auto">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام إدارة الموارد البشرية</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            <span>الإصدار المتميز</span>
            <FaCrown className="text-[#c9a227]" />
          </p>
        </div>
      </footer>
    </div>
  );
};

// مكون بطاقة الإحصائية
const StatCard = ({ title, value, icon, color, change }) => {
  const changeType = change >= 0 ? "positive" : "negative";

  return (
    <Card className="rounded-2xl shadow-xl border border-[#2a2a4a] bg-[#0f0f18]/70 backdrop-blur-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}
      ></div>
      <CardBody className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[#a0a0b0] text-sm">{title}</span>
            <span className="text-2xl font-bold mt-1 text-[#d4c690] group-hover:text-[#c9a227] transition-colors">
              {value}
            </span>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded-full backdrop-blur-sm border border-[#2a2a4a] group-hover:bg-[#2a2a4a] transition-colors">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <span
              className={`text-sm font-medium flex items-center ${
                changeType === "positive" ? "text-[#86efac]" : "text-[#fca5a5]"
              }`}
            >
              {changeType === "positive" ? (
                <FiTrendingUp className="mr-1" />
              ) : (
                <FiTrendingDown className="mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-[#a0a0b0] text-sm ml-2">
              {changeType === "positive" ? "زيادة" : "انخفاض"} عن الشهر الماضي
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Dashboard;