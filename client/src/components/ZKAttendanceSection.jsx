'use client';
import { useState, useEffect } from 'react';
import { FaSync, FaSearch, FaFileExport, FaUserClock, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';

const ZKAttendanceSection = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [deviceIp, setDeviceIp] = useState('192.168.1.201');
    const [devicePort, setDevicePort] = useState(4370);
    const [report, setReport] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // بيانات تجريبية للتأكد من عمل الواجهة
    const demoData = [
        {
            _id: '1',
            employee: {
                _id: 'emp1',
                fullName: 'محمد أحمد',
                employeeId: 'EMP001',
                department: 'المبيعات'
            },
            shift: {
                _id: 'shift1',
                name: 'الصباحي',
                startTime: '08:00',
                endTime: '16:00'
            },
            checkIn: new Date(2025, 6, 9, 8, 15),
            checkOut: new Date(2025, 6, 9, 15, 45),
            workingHours: 7.5,
            delay: 15,
            status: 'متأخر'
        },
        {
            _id: '2',
            employee: {
                _id: 'emp2',
                fullName: 'علي حسن',
                employeeId: 'EMP002',
                department: 'التسويق'
            },
            shift: {
                _id: 'shift2',
                name: 'المسائي',
                startTime: '16:00',
                endTime: '00:00'
            },
            checkIn: new Date(2025, 6, 9, 16, 5),
            checkOut: null,
            workingHours: 0,
            delay: 5,
            status: 'حاضر'
        }
    ];

    const fetchAttendance = async (date) => {
        try {
            setLoading(true);
            const dateStr = date.toISOString().split('T')[0];
            const res = await fetch(`${apiUrl}/api/attendance/daily?date=${dateStr}`);

            if (!res.ok) throw new Error('فشل جلب البيانات');

            const data = await res.json();

            // إذا لم توجد بيانات، نستخدم البيانات التجريبية
            if (data.data && data.data.length > 0) {
                setAttendance(data.data);
            } else {
                setAttendance(demoData);
                toast.info('لا توجد بيانات حقيقية، يتم عرض بيانات تجريبية');
            }
        } catch (error) {
            toast.error(error.message);
            setAttendance(demoData); // استخدام البيانات التجريبية في حالة الخطأ
        } finally {
            setLoading(false);
        }
    };

    const syncWithDevice = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiUrl}/api/attendance/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceIp, devicePort })
            });

            if (!res.ok) throw new Error('فشل المزامنة');

            const data = await res.json();
            toast.success(data.message);
            fetchAttendance(selectedDate);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            const startDate = new Date(selectedDate);
            startDate.setDate(1);

            const endDate = new Date(selectedDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);

            const res = await fetch(
                `${apiUrl}/api/attendance/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (!res.ok) throw new Error('فشل توليد التقرير');

            const data = await res.json();

            // إذا لم توجد بيانات، نستخدم بيانات تجريبية
            if (data.data && data.data.length > 0) {
                setReport(data.data);
            } else {
                setReport([
                    {
                        _id: '1',
                        fullName: 'محمد أحمد',
                        employeeId: 'EMP001',
                        department: 'المبيعات',
                        totalPresent: 22,
                        totalAbsent: 2,
                        totalDelay: 120,
                        averageWorkingHours: 7.5
                    },
                    {
                        _id: '2',
                        fullName: 'علي حسن',
                        employeeId: 'EMP002',
                        department: 'التسويق',
                        totalPresent: 20,
                        totalAbsent: 4,
                        totalDelay: 45,
                        averageWorkingHours: 6.8
                    }
                ]);
                toast.info('لا توجد بيانات حقيقية، يتم عرض بيانات تجريبية');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance(selectedDate);
    }, [selectedDate]);

    const formatTime = (date) => {
        if (!date) return '--:--';
        return new Date(date).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStatusBadge = (status) => {
        const colors = {
            حاضر: 'bg-green-100 text-green-800',
            متأخر: 'bg-yellow-100 text-yellow-800',
            غياب: 'bg-red-100 text-red-800',
            'غياب جزئي': 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    // دالة لتسجيل الانصراف
    const handleCheckOut = async (id) => {
        try {
            // في تطبيق حقيقي، هنا ستكون استدعاء API لتحديث السجل في قاعدة البيانات
            /*
            await fetch(`${apiUrl}/api/attendance/${id}/checkout`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ checkOut: new Date() })
            });
            */

            setAttendance(prev =>
                prev.map(attendanceRecord =>
                    attendanceRecord._id === id
                        ? { ...attendanceRecord, checkOut: new Date() }
                        : attendanceRecord
                )
            );

            toast.success('تم تسجيل الانصراف بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء تسجيل الانصراف');
        }
    };

    // دالة لتسجيل الحضور
    const handleCheckIn = async (employeeId) => {
        try {
            // في تطبيق حقيقي، هنا ستكون استدعاء API لتسجيل الحضور
            /*
            await fetch(`${apiUrl}/api/attendance/manual-checkin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId, checkInTime: new Date() })
            });
            */

            const employee = demoData.find(d => d.employee._id === employeeId)?.employee;

            if (employee) {
                const newRecord = {
                    _id: `temp-${Date.now()}`,
                    employee,
                    checkIn: new Date(),
                    shift: {
                        name: 'افتراضي',
                        startTime: '08:00',
                        endTime: '16:00'
                    },
                    workingHours: 0,
                    delay: 0,
                    status: 'حاضر'
                };

                setAttendance(prev => [...prev, newRecord]);
                toast.success('تم تسجيل الحضور بنجاح');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تسجيل الحضور');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mt-6"
        >
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <FaUserClock className="mr-2" /> نظام البصمة - ZKTeco
                    </h2>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center bg-blue-800 rounded-lg px-3 py-1.5">
                            <input
                                type="text"
                                value={deviceIp}
                                onChange={(e) => setDeviceIp(e.target.value)}
                                className="bg-transparent text-white placeholder-blue-200 w-32 focus:outline-none"
                                placeholder="IP الجهاز"
                            />
                            <span className="mx-2">:</span>
                            <input
                                type="number"
                                value={devicePort}
                                onChange={(e) => setDevicePort(e.target.value)}
                                className="bg-transparent text-white w-20 focus:outline-none"
                                placeholder="Port"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={syncWithDevice}
                            className="bg-white text-blue-700 px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-shadow"
                            disabled={loading}
                        >
                            <FaSync className={`ml-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'جاري المزامنة...' : 'مزامنة الجهاز'}
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-blue-800 font-medium">تاريخ السجلات</h3>
                            <DatePicker
                                selected={selectedDate}
                                onChange={setSelectedDate}
                                dateFormat="yyyy/MM/dd"
                                className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-blue-800"
                            />
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-green-800 font-medium">عدد الحضور</h3>
                            <span className="text-2xl font-bold text-green-700">
                                {attendance.filter(a => a.status !== 'غياب').length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-orange-800 font-medium">التقارير الشهرية</h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={generateReport}
                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg flex items-center text-sm"
                                disabled={loading}
                            >
                                <FaFileExport className="ml-1" /> {loading ? 'جاري التحميل...' : 'توليد تقرير'}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {report ? (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">تقرير الحضور الشهري</h3>
                            <button
                                onClick={() => setReport(null)}
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                            >
                                العودة لسجلات اليوم
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الموظف</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">القسم</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">أيام الحضور</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">أيام الغياب</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">مجموع التأخير (دقيقة)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">متوسط ساعات العمل</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {emp.fullName} ({emp.employeeId})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {emp.department}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {emp.totalPresent}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {emp.totalAbsent}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                                                {Math.round(emp.totalDelay)} دقيقة
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                {emp.averageWorkingHours.toFixed(2)} ساعة
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6 flex items-start">
                            <FaExclamationTriangle className="text-yellow-500 text-xl mr-2 mt-0.5" />
                            <div>
                                <p className="text-yellow-800 font-medium">ملاحظة هامة</p>
                                <p className="text-yellow-700 text-sm">
                                    يتم عرض بيانات تجريبية للتوضيح. قم بمزامنة جهاز البصمة لعرض البيانات الحقيقية.
                                </p>
                            </div>
                        </div>

                        <div className="mb-6 relative max-w-md">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                placeholder="ابحث عن موظف..."
                                className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                onChange={(e) => {
                                    const searchTerm = e.target.value.toLowerCase();
                                    if (!searchTerm) {
                                        fetchAttendance(selectedDate);
                                    } else {
                                        setAttendance(prev =>
                                            prev.filter(attendanceRecord =>
                                                attendanceRecord.employee.fullName.toLowerCase().includes(searchTerm) ||
                                                attendanceRecord.employee.employeeId.includes(searchTerm)
                                            ))
                                    }
                                }}
                            />
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">رقم الموظف</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الاسم</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الشفت</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الحضور</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الانصراف</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">ساعات العمل</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التأخير</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                                </div>
                                                <p className="mt-4 text-gray-600">جاري تحميل سجلات الحضور...</p>
                                            </td>
                                        </tr>
                                    ) : attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                لا توجد سجلات حضور لهذا اليوم
                                            </td>
                                        </tr>
                                    ) : (
                                        attendance.map((attendanceRecord) => (
                                            <motion.tr
                                                key={attendanceRecord._id}
                                                className="hover:bg-gray-50"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {attendanceRecord.employee.employeeId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendanceRecord.employee.fullName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {attendanceRecord.shift?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                    {attendanceRecord.checkIn ? formatTime(attendanceRecord.checkIn) : (
                                                        <button
                                                            onClick={() => handleCheckIn(attendanceRecord.employee._id)}
                                                            className="text-green-600 hover:text-green-800 text-xs bg-green-50 px-2 py-1 rounded"
                                                        >
                                                            تسجيل حضور
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                    {attendanceRecord.checkOut ? formatTime(attendanceRecord.checkOut) : (
                                                        <button
                                                            onClick={() => handleCheckOut(attendanceRecord._id)}
                                                            className="text-red-600 hover:text-red-800 text-xs bg-red-50 px-2 py-1 rounded"
                                                            disabled={!attendanceRecord.checkIn}
                                                        >
                                                            تسجيل الانصراف
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {attendanceRecord.workingHours?.toFixed(2) || '0.00'} ساعة
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                                                    {attendanceRecord.delay ? `${Math.round(attendanceRecord.delay)} دقيقة` : '--'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {renderStatusBadge(attendanceRecord.status)}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default ZKAttendanceSection;