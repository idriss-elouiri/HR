'use client';
import React, { useState, useEffect } from 'react';
import { FaUser, FaMoneyBillWave, FaClock, FaCalendarTimes, FaFileExcel, FaFilePdf, FaSearch, FaPrint } from 'react-icons/fa';
import { MdOutlineArrowDropDown } from 'react-icons/md';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/TopNavbar';
import Chart from 'react-apexcharts';

const AllReports = () => {
    const [activeTab, setActiveTab] = useState('employee');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState([]);
    const [annualReport, setAnnualReport] = useState([]);

    const [filters, setFilters] = useState({
        employeeId: '',
        department: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: ''
    });

    // Employee report chart data
    const employeeChartOptions = {
        chart: {
            id: 'employee-chart',
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        colors: ['#4F46E5', '#10B981', '#EF4444'],
        labels: ['نشط', 'موقوف', 'مفصول'],
        legend: {
            position: 'bottom',
            fontSize: '14px',
            fontFamily: 'inherit',
            labels: { colors: '#6B7280' }
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '14px', fontFamily: 'inherit' }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'المجموع',
                            color: '#4B5563',
                            fontSize: '16px'
                        }
                    }
                }
            }
        }
    };

    const [employeeChartSeries, setEmployeeChartSeries] = useState([0, 0, 0]);

    // Financial report chart data
    const financialChartOptions = {
        chart: {
            id: 'financial-chart',
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        colors: ['#4F46E5', '#10B981'],
        xaxis: {
            categories: [],
            labels: { style: { colors: '#6B7280', fontSize: '12px' } }
        },
        yaxis: {
            labels: { style: { colors: '#6B7280', fontSize: '12px' } },
            title: { text: 'المبلغ (ريال)', style: { color: '#6B7280', fontSize: '14px' } }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        grid: { borderColor: '#E5E7EB' },
        tooltip: { theme: 'light' },
        legend: {
            position: 'top',
            fontSize: '14px',
            fontFamily: 'inherit',
            labels: { colors: '#6B7280' }
        }
    };

    const [financialChartSeries, setFinancialChartSeries] = useState([
        { name: 'إجمالي الرواتب', data: [] },
        { name: 'متوسط الرواتب', data: [] }
    ]);

    // Fetch reports data using fetch API
    const fetchReports = async () => {
        setLoading(true);
        try {
            // 1. Fetch employee report
            const empQuery = new URLSearchParams({
                page: 1,
                limit: 1000,
                search: '',
                status: filters.status
            }).toString();

            const empRes = await fetch(`/api/employees?${empQuery}`, {
                credentials: 'include',
            });
            if (!empRes.ok) throw new Error('Failed to fetch employees');
            const empData = await empRes.json();
            setEmployees(empData.data || []);

            // Calculate status counts for chart
            const active = empData.data.filter(e => e.employmentStatus === 'نشط').length;
            const suspended = empData.data.filter(e => e.employmentStatus === 'موقوف').length;
            const terminated = empData.data.filter(e => e.employmentStatus === 'مفصول').length;
            setEmployeeChartSeries([active, suspended, terminated]);

            // 2. Fetch salaries report
            const salQuery = new URLSearchParams({
                month: filters.month,
                year: filters.year,
                status: filters.status
            }).toString();

            const salRes = await fetch(`/api/salaries?${salQuery}`, {
                credentials: 'include',
            });
            if (!salRes.ok) throw new Error('Failed to fetch salaries');
            const salData = await salRes.json();
            setSalaries(salData.data || []);

            // Prepare financial chart data
            const monthlySalaries = {};
            (salData.data || []).forEach(salary => {
                const monthKey = `${salary.year}-${salary.month}`;
                if (!monthlySalaries[monthKey]) {
                    monthlySalaries[monthKey] = { total: 0, count: 0 };
                }
                monthlySalaries[monthKey].total += salary.netSalary;
                monthlySalaries[monthKey].count++;
            });

            const categories = Object.keys(monthlySalaries).sort();
            const totalSeries = [];
            const avgSeries = [];

            categories.forEach(key => {
                totalSeries.push(monthlySalaries[key].total);
                avgSeries.push(Math.round(monthlySalaries[key].total / monthlySalaries[key].count));
            });

            setFinancialChartSeries([
                { name: 'إجمالي الرواتب', data: totalSeries },
                { name: 'متوسط الرواتب', data: avgSeries }
            ]);

            // Update financial chart categories
            financialChartOptions.xaxis.categories = categories.map(cat => {
                const [year, month] = cat.split('-');
                const monthNames = [
                    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                ];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            });

            // 3. Fetch absences report
            const absQuery = new URLSearchParams({
                month: filters.month,
                year: filters.year,
                employeeId: filters.employeeId
            }).toString();

            const absRes = await fetch(`/api/absences?${absQuery}`, {
                credentials: 'include',
            });
            if (!absRes.ok) throw new Error('Failed to fetch absences');
            const absData = await absRes.json();
            setAbsences(absData.data || []);

            // 4. Fetch monthly report
            const monthlyQuery = new URLSearchParams({
                month: filters.month,
                year: filters.year
            }).toString();

            const monthlyRes = await fetch(`/api/reports/monthly?${monthlyQuery}`, {
                credentials: 'include',
            });
            if (!monthlyRes.ok) throw new Error('Failed to fetch monthly report');
            const monthlyData = await monthlyRes.json();
            setMonthlyReport(monthlyData.data || []);

            // 5. Fetch annual report
            const annualRes = await fetch(`/api/reports/annual/${filters.year}`, {
                credentials: 'include',
            });
            if (!annualRes.ok) throw new Error('Failed to fetch annual report');
            const annualData = await annualRes.json();
            setAnnualReport(annualData.data || []);

        } catch (error) {
            console.error('Error fetching reports:', error);
            // يمكنك إضافة عرض رسالة خطأ للمستخدم هنا
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filters]);

    // Export functions
    const exportToExcel = (data, filename) => {
        // Implementation for Excel export
        console.log(`Exporting to Excel: ${filename}`);
        alert(`تم تصدير ${filename} إلى Excel بنجاح`);
    };

    const exportToPDF = (data, filename) => {
        // Implementation for PDF export
        console.log(`Exporting to PDF: ${filename}`);
        alert(`تم تصدير ${filename} إلى PDF بنجاح`);
    };

    const printReport = () => {
        window.print();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    // Render functions for each report
    const renderEmployeeReport = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">التقرير الشامل للموظفين</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => exportToExcel(employees, 'تقرير_الموظفين')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFileExcel /> Excel
                    </button>
                    <button
                        onClick={() => exportToPDF(employees, 'تقرير_الموظفين')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFilePdf /> PDF
                    </button>
                    <button
                        onClick={printReport}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaPrint /> طباعة
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-indigo-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4">إحصائية حالة الموظفين</h3>
                    <Chart
                        options={employeeChartOptions}
                        series={employeeChartSeries}
                        type="donut"
                        height={350}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الموظف</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التوظيف</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.slice(0, 5).map(employee => (
                                <tr key={employee._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.employmentStatus === 'نشط' ? 'bg-green-100 text-green-800' :
                                            employee.employmentStatus === 'موقوف' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {employee.employmentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(employee.hireDate).toLocaleDateString('ar-EG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-center">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                            عرض الكل ({employees.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancialReport = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">التقارير المالية</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => exportToExcel(salaries, 'التقرير_المالي')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFileExcel /> Excel
                    </button>
                    <button
                        onClick={() => exportToPDF(salaries, 'التقرير_المالي')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {salaries.reduce((sum, salary) => sum + salary.netSalary, 0).toLocaleString('ar-EG')} ر.س
                    </div>
                    <div className="text-indigo-100">إجمالي الرواتب</div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {salaries.length > 0
                            ? (salaries.reduce((sum, salary) => sum + salary.netSalary, 0) / salaries.length).toLocaleString('ar-EG', { maximumFractionDigits: 0 })
                            : 0} ر.س
                    </div>
                    <div className="text-emerald-100">متوسط الراتب</div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {salaries.filter(s => s.status === 'مسددة').length}
                    </div>
                    <div className="text-amber-100">رواتب مسددة</div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">تطور الرواتب الشهرية</h3>
                <Chart
                    options={financialChartOptions}
                    series={financialChartSeries}
                    type="line"
                    height={350}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الشهر</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الراتب الأساسي</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإضافات</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخصومات</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصافي</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salaries.slice(0, 5).map(salary => (
                            <tr key={salary._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {salary.employee?.fullName || 'غير محدد'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {salary.month}/{salary.year}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {salary.baseSalary.toLocaleString('ar-EG')} ر.س
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                                    {salary.allowances.reduce((sum, a) => sum + a.amount, 0).toLocaleString('ar-EG')} ر.س
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                    {salary.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString('ar-EG')} ر.س
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {salary.netSalary.toLocaleString('ar-EG')} ر.س
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${salary.status === 'مسددة' ? 'bg-green-100 text-green-800' :
                                        salary.status === 'معتمدة' ? 'bg-blue-100 text-blue-800' :
                                            salary.status === 'مسودة' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {salary.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendanceReport = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">تقارير الحضور والانصراف</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => exportToExcel(attendance, 'تقرير_الحضور')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFileExcel /> Excel
                    </button>
                    <button
                        onClick={() => exportToPDF(attendance, 'تقرير_الحضور')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {attendance.length}
                    </div>
                    <div className="text-blue-100">سجلات الحضور</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {new Set(attendance.map(a => a.employee?._id)).size}
                    </div>
                    <div className="text-purple-100">موظفين مسجلين</div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {attendance.filter(a => a.status === 'موافق عليها').length}
                    </div>
                    <div className="text-cyan-100">حضور معتمد</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الدخول</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الخروج</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.slice(0, 5).map(record => (
                            <tr key={record._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {record.employee?.fullName || 'غير محدد'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(record.date).toLocaleDateString('ar-EG')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.checkInTime || '--:--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.checkOutTime || '--:--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.workHours || '--'} ساعات
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'موافق عليها' ? 'bg-green-100 text-green-800' :
                                        record.status === 'معلقة' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAbsencesReport = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">تقرير الغياب والتأخيرات</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => exportToExcel(absences, 'تقرير_الغياب')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFileExcel /> Excel
                    </button>
                    <button
                        onClick={() => exportToPDF(absences, 'تقرير_الغياب')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {absences.length}
                    </div>
                    <div className="text-rose-100">حالات الغياب</div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {absences.filter(a => a.type === 'تأخير').length}
                    </div>
                    <div className="text-orange-100">حالات التأخير</div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                        {absences.filter(a => a.type === 'انصراف مبكر').length}
                    </div>
                    <div className="text-amber-100">انصراف مبكر</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {absences.slice(0, 5).map(absence => (
                            <tr key={absence._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {absence.employee?.fullName || 'غير محدد'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(absence.date).toLocaleDateString('ar-EG')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {absence.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {absence.duration} ساعات
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {absence.reason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${absence.status === 'موافق عليها' ? 'bg-green-100 text-green-800' :
                                        absence.status === 'معلقة' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {absence.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">نظام التقارير</h1>
                        <p className="text-gray-600 mt-2">إدارة وعرض جميع التقارير المتعلقة بالموظفين والعمليات</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموظف</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={filters.employeeId}
                                        onChange={handleFilterChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="ابحث برقم الموظف"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
                                <select
                                    name="month"
                                    value={filters.month}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                    min="2000"
                                    max="2100"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">الكل</option>
                                    <option value="نشط">نشط</option>
                                    <option value="موقوف">موقوف</option>
                                    <option value="مفصول">مفصول</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('employee')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'employee'
                                ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaUser className="text-lg" />
                            تقرير الموظفين
                        </button>

                        <button
                            onClick={() => setActiveTab('financial')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'financial'
                                ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaMoneyBillWave className="text-lg" />
                            التقارير المالية
                        </button>

                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'attendance'
                                ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaClock className="text-lg" />
                            الحضور والانصراف
                        </button>

                        <button
                            onClick={() => setActiveTab('absences')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'absences'
                                ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaCalendarTimes className="text-lg" />
                            الغياب والتأخيرات
                        </button>
                    </div>

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {/* Tab content */}
                    {!loading && (
                        <>
                            {activeTab === 'employee' && renderEmployeeReport()}
                            {activeTab === 'financial' && renderFinancialReport()}
                            {activeTab === 'attendance' && renderAttendanceReport()}
                            {activeTab === 'absences' && renderAbsencesReport()}
                        </>
                    )}

                    {/* Monthly and Annual Reports */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">التقرير الشهري</h3>
                                <button
                                    onClick={() => exportToExcel(monthlyReport, 'التقرير_الشهري')}
                                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm"
                                >
                                    تصدير
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجازات (أيام)</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الغياب (مرات)</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعات الغياب</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {monthlyReport.slice(0, 4).map((item, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.fullName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalLeaves}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalAbsences}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalHours}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">التقرير السنوي ({filters.year})</h3>
                                <button
                                    onClick={() => exportToExcel(annualReport, 'التقرير_السنوي')}
                                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm"
                                >
                                    تصدير
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجازات (أيام)</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الغياب (مرات)</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعات الغياب</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {annualReport.slice(0, 4).map((item, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.fullName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalLeaves}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalAbsences}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.totalHours}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AllReports;