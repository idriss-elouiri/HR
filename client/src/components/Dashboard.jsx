"use client";

import { useState, useEffect } from 'react';
import {
    Card, CardBody, CardHeader, Divider, Spinner, Button,
    Badge, Progress, Avatar, Chip, Tabs, Tab
} from '@nextui-org/react';
import {
    FaUsers, FaCalendarTimes, FaCalendarCheck, FaMoneyBillWave,
    FaChartLine, FaUserClock, FaFileExcel, FaFilePdf, FaEllipsisV
} from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/ar';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [currentMonth] = useState(moment().format('MMMM YYYY'));
    const [error, setError] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // جلب بيانات لوحة التحكم من API باستخدام fetch
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // جلب البيانات باستخدام fetch
                const response = await fetch(`${apiUrl}/api/dashboard`);

                if (!response.ok) {
                    throw new Error('فشل في جلب بيانات لوحة التحكم');
                }

                const data = await response.json();
                setDashboardData(data);

            } catch (error) {
                console.error('فشل في جلب بيانات لوحة التحكم:', error);
                setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // تحديث البيانات كل دقيقة
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    // تنسيق الأرقام
    const formatNumber = (num) => {
        return new Intl.NumberFormat('ar-EG').format(num);
    };

    // تنسيق التاريخ
    const formatDate = (dateString) => {
        return moment(dateString).locale('ar').format('DD MMMM YYYY');
    };

    if (loading || !dashboardData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-indigo-950">
                <Spinner size="lg" color="secondary" />
                <span className="ml-3 text-lg text-purple-100">جاري تحميل بيانات لوحة التحكم...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen p-4 bg-gradient-to-br from-gray-900 to-indigo-950">
                <div className="bg-gradient-to-r from-red-700/70 to-rose-800/70 p-8 rounded-2xl text-center max-w-md backdrop-blur-sm border border-red-500/30 shadow-xl">
                    <h2 className="text-xl font-bold text-red-100 mb-3">حدث خطأ</h2>
                    <p className="text-red-200 mb-6">{error}</p>
                    <Button
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg"
                        onClick={() => window.location.reload()}
                    >
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-300">
                            لوحة التحكم الذكية
                        </h1>
                        <p className="text-purple-200 mt-2">
                            نظرة عامة على إحصائيات النظام والأنشطة الحديثة - {currentMonth}
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                            startContent={<FaFileExcel className="text-white" />}
                        >
                            تصدير Excel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold shadow-lg shadow-rose-500/20"
                            startContent={<FaFilePdf className="text-white" />}
                        >
                            تصدير PDF
                        </Button>
                    </div>
                </div>

                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                    color="secondary"
                    variant="light"
                    className="mb-6"
                    classNames={{
                        tab: "text-lg font-medium px-6",
                        cursor: "bg-gradient-to-r from-purple-500 to-indigo-500"
                    }}
                >
                    <Tab key="overview" title="نظرة عامة" />
                    <Tab key="analytics" title="التحليلات" />
                </Tabs>

                {activeTab === 'overview' ? (
                    <>
                        {/* بطاقات الإحصائيات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="عدد الموظفين"
                                value={dashboardData?.employeesCount || 0}
                                icon={<FaUsers className="text-2xl text-blue-300" />}
                                color="from-blue-700/70 to-blue-800/70"
                                change={dashboardData?.employeesChange || 0}
                            />

                            <StatCard
                                title="الغيابات اليوم"
                                value={dashboardData?.todayAbsences || 0}
                                icon={<FaCalendarTimes className="text-2xl text-rose-300" />}
                                color="from-rose-700/70 to-rose-800/70"
                                change={dashboardData?.absencesChange || 0}
                            />

                            <StatCard
                                title="الإجازات المعتمدة"
                                value={dashboardData?.approvedLeaves || 0}
                                icon={<FaCalendarCheck className="text-2xl text-emerald-300" />}
                                color="from-emerald-700/70 to-emerald-800/70"
                                change={dashboardData?.leavesChange || 0}
                            />

                            <StatCard
                                title="مجموع الرواتب"
                                value={`${formatNumber(dashboardData?.monthlySalaries || 0)} ر.س`}
                                icon={<FaMoneyBillWave className="text-2xl text-amber-300" />}
                                color="from-amber-600/70 to-amber-700/70"
                                change={dashboardData?.salariesChange || 0}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* الموظفون النشطون */}
                            <Card className="rounded-2xl shadow-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm">
                                <CardHeader className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                        <FaUserClock className="text-indigo-400 text-xl" />
                                        <h2 className="text-xl font-semibold text-indigo-100">الموظفون النشطون اليوم</h2>
                                    </div>
                                    <Badge
                                        color="primary"
                                        content={dashboardData?.activeEmployees?.length || 0}
                                        size="lg"
                                        className="bg-indigo-600 text-white"
                                    />
                                </CardHeader>
                                <Divider className="bg-indigo-500/30" />
                                <CardBody className="p-0">
                                    <div className="max-h-96 overflow-y-auto">
                                        {dashboardData?.activeEmployees?.length > 0 ? (
                                            dashboardData.activeEmployees.map(employee => (
                                                <div
                                                    key={employee._id}
                                                    className="p-4 border-b border-indigo-500/10 last:border-0 hover:bg-indigo-900/20 transition-all duration-300"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar
                                                            showFallback
                                                            name={employee.name}
                                                            className="w-16 h-16 text-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-medium text-indigo-100">{employee.name}</h3>
                                                                    <p className="text-indigo-300 text-sm">{employee.position}</p>
                                                                </div>
                                                                <Chip
                                                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                                                                    size="sm"
                                                                >
                                                                    {employee.status}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                <Chip
                                                                    variant="flat"
                                                                    className="bg-indigo-900/50 text-indigo-200 border border-indigo-500/30"
                                                                    size="sm"
                                                                    startContent={<span className="text-xs text-indigo-400">القسم:</span>}
                                                                >
                                                                    {employee.department}
                                                                </Chip>
                                                                <Chip
                                                                    variant="flat"
                                                                    className="bg-purple-900/50 text-purple-200 border border-purple-500/30"
                                                                    size="sm"
                                                                    startContent={<span className="text-xs text-purple-400">الوردية:</span>}
                                                                >
                                                                    {employee.schedule}
                                                                </Chip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <FaUserClock className="mx-auto text-3xl text-indigo-500/30 mb-3" />
                                                <p>لا يوجد موظفون نشطون حالياً</p>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            {/* الإجازات القادمة */}
                            <Card className="rounded-2xl shadow-xl border border-emerald-500/20 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm">
                                <CardHeader className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarCheck className="text-emerald-400 text-xl" />
                                        <h2 className="text-xl font-semibold text-emerald-100">الإجازات القادمة</h2>
                                    </div>
                                    <Badge
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                                        content={dashboardData?.upcomingLeaves?.length || 0}
                                        size="lg"
                                    />
                                </CardHeader>
                                <Divider className="bg-emerald-500/30" />
                                <CardBody className="p-0">
                                    <div className="max-h-96 overflow-y-auto">
                                        {dashboardData?.upcomingLeaves?.length > 0 ? (
                                            dashboardData.upcomingLeaves.map((leave, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 border-b border-emerald-500/10 last:border-0 hover:bg-emerald-900/20 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="font-medium text-emerald-100">{leave.name}</h3>
                                                            <p className="text-emerald-300 text-sm">{leave.detail}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-emerald-400">{formatDate(leave.date)}</p>
                                                            <Chip
                                                                className="mt-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                                                                size="sm"
                                                            >
                                                                {leave.status}
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <FaCalendarCheck className="mx-auto text-3xl text-emerald-500/30 mb-3" />
                                                <p>لا توجد إجازات قادمة</p>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* طلبات الغياب الأخيرة */}
                            <Card className="rounded-2xl shadow-xl border border-rose-500/20 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm">
                                <CardHeader className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarTimes className="text-rose-400 text-xl" />
                                        <h2 className="text-xl font-semibold text-rose-100">طلبات الغياب الأخيرة</h2>
                                    </div>
                                    <Badge
                                        className="bg-gradient-to-r from-rose-600 to-rose-700 text-white"
                                        content={dashboardData?.recentAbsences?.length || 0}
                                        size="lg"
                                    />
                                </CardHeader>
                                <Divider className="bg-rose-500/30" />
                                <CardBody className="p-0">
                                    <div className="max-h-96 overflow-y-auto">
                                        {dashboardData?.recentAbsences?.length > 0 ? (
                                            dashboardData.recentAbsences.map((absence, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 border-b border-rose-500/10 last:border-0 hover:bg-rose-900/20 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="font-medium text-rose-100">{absence.name}</h3>
                                                            <p className="text-rose-300 text-sm">{absence.detail}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-rose-400">{formatDate(absence.date)}</p>
                                                            <Chip
                                                                className={`mt-1 ${absence.status === 'موافق عليها' ?
                                                                    'bg-gradient-to-r from-emerald-600 to-emerald-700' :
                                                                    'bg-gradient-to-r from-amber-600 to-amber-700'} text-white`}
                                                                size="sm"
                                                            >
                                                                {absence.status}
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <FaCalendarTimes className="mx-auto text-3xl text-rose-500/30 mb-3" />
                                                <p>لا توجد طلبات غياب حديثة</p>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            {/* الرواتب المستحقة */}
                            <Card className="rounded-2xl shadow-xl border border-amber-500/20 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm">
                                <CardHeader className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                        <FaMoneyBillWave className="text-amber-400 text-xl" />
                                        <h2 className="text-xl font-semibold text-amber-100">الرواتب المستحقة</h2>
                                    </div>
                                    <Badge
                                        className="bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                                        content={dashboardData?.pendingSalaries?.length || 0}
                                        size="lg"
                                    />
                                </CardHeader>
                                <Divider className="bg-amber-500/30" />
                                <CardBody className="p-0">
                                    <div className="max-h-96 overflow-y-auto">
                                        {dashboardData?.pendingSalaries?.length > 0 ? (
                                            dashboardData.pendingSalaries.map((salary, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 border-b border-amber-500/10 last:border-0 hover:bg-amber-900/20 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="font-medium text-amber-100">{salary.name}</h3>
                                                            <p className="text-amber-300 text-sm">{salary.detail}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-amber-400">{salary.date}</p>
                                                            <Chip
                                                                className="mt-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                                                                size="sm"
                                                            >
                                                                {salary.status}
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <FaMoneyBillWave className="mx-auto text-3xl text-amber-500/30 mb-3" />
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
                        <Card className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-rose-500/20">
                            <CardHeader className="flex items-center justify-between p-0 mb-6">
                                <div className="flex items-center gap-2">
                                    <FaCalendarTimes className="text-rose-400 text-xl" />
                                    <h2 className="text-xl font-semibold text-rose-100">معدل الغياب الشهري</h2>
                                </div>
                                <Button isIconOnly variant="light" className="bg-gray-700/50 text-rose-300">
                                    <FaEllipsisV />
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="space-y-6">
                                    {dashboardData?.absenceTrend?.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-300">{item.label}</span>
                                                <span className="font-medium text-rose-100">{item.value} حالة</span>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={item.percentage}
                                                classNames={{
                                                    indicator: "bg-gradient-to-r from-rose-600 to-rose-700",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* توزيع الإجازات */}
                        <Card className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-emerald-500/20">
                            <CardHeader className="flex items-center justify-between p-0 mb-6">
                                <div className="flex items-center gap-2">
                                    <FaCalendarCheck className="text-emerald-400 text-xl" />
                                    <h2 className="text-xl font-semibold text-emerald-100">توزيع الإجازات</h2>
                                </div>
                                <Button isIconOnly variant="light" className="bg-gray-700/50 text-emerald-300">
                                    <FaEllipsisV />
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="space-y-6">
                                    {dashboardData?.leaveDistribution?.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-300">{item.label}</span>
                                                <span className="font-medium text-emerald-100">{item.value} إجازة</span>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={item.percentage}
                                                classNames={{
                                                    indicator: "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* الراتب الشهري */}
                        <Card className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-amber-500/20">
                            <CardHeader className="flex items-center justify-between p-0 mb-6">
                                <div className="flex items-center gap-2">
                                    <FaMoneyBillWave className="text-amber-400 text-xl" />
                                    <h2 className="text-xl font-semibold text-amber-100">الراتب الشهري</h2>
                                </div>
                                <Button isIconOnly variant="light" className="bg-gray-700/50 text-amber-300">
                                    <FaEllipsisV />
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl mb-6 shadow-lg shadow-amber-500/20">
                                    <div className="text-center">
                                        <p className="text-lg">إجمالي الرواتب الشهرية</p>
                                        <p className="text-3xl font-bold mt-2">
                                            {formatNumber(dashboardData?.monthlySalaries || 0)} ر.س
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-800/70 to-blue-900/70 p-4 rounded-xl border border-blue-500/30">
                                        <p className="text-blue-300">الزيادة عن الشهر الماضي</p>
                                        <p className="text-xl font-bold text-blue-100">
                                            {dashboardData?.salariesChange || 0}%
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-800/70 to-emerald-900/70 p-4 rounded-xl border border-emerald-500/30">
                                        <p className="text-emerald-300">عدد الموظفين المستحقين</p>
                                        <p className="text-xl font-bold text-emerald-100">
                                            {dashboardData?.employeesCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* إحصائيات الموظفين */}
                        <Card className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-indigo-500/20">
                            <CardHeader className="flex items-center justify-between p-0 mb-6">
                                <div className="flex items-center gap-2">
                                    <FaUsers className="text-indigo-400 text-xl" />
                                    <h2 className="text-xl font-semibold text-indigo-100">إحصائيات الموظفين</h2>
                                </div>
                                <Button isIconOnly variant="light" className="bg-gray-700/50 text-indigo-300">
                                    <FaEllipsisV />
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-800/70 to-blue-900/70 p-4 rounded-xl border border-blue-500/30">
                                        <p className="text-blue-300">الزيادة عن الشهر الماضي</p>
                                        <p className="text-xl font-bold text-blue-100">
                                            {dashboardData?.employeesChange || 0}%
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-800/70 to-emerald-900/70 p-4 rounded-xl border border-emerald-500/30">
                                        <p className="text-emerald-300">الموظفون النشطون</p>
                                        <p className="text-xl font-bold text-emerald-100">
                                            {dashboardData?.activeEmployees?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-800/70 to-amber-900/70 p-4 rounded-xl border border-amber-500/30">
                                        <p className="text-amber-300">في إجازة</p>
                                        <p className="text-xl font-bold text-amber-100">
                                            {dashboardData?.approvedLeaves || 0}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-rose-800/70 to-rose-900/70 p-4 rounded-xl border border-rose-500/30">
                                        <p className="text-rose-300">غائبون اليوم</p>
                                        <p className="text-xl font-bold text-rose-100">
                                            {dashboardData?.todayAbsences || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

// مكون بطاقة الإحصائية
const StatCard = ({ title, value, icon, color, change }) => {
    const changeType = change >= 0 ? 'positive' : 'negative';

    return (
        <Card className="rounded-2xl shadow-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>
            <CardBody className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">{title}</span>
                        <span className="text-2xl font-bold mt-1 text-white">{value}</span>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-full backdrop-blur-sm border border-gray-600">
                        {icon}
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center">
                        <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {changeType === 'positive' ? '▲' : '▼'} {Math.abs(change)}%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                            {changeType === 'positive' ? 'زيادة' : 'انخفاض'} عن الشهر الماضي
                        </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default Dashboard;