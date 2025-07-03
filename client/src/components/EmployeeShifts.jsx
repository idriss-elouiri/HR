'use client';
import { useState, useEffect } from 'react';
import { Select, SelectItem, Button, Spinner, Chip, Tooltip } from "@nextui-org/react";
import { FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeShifts = () => {
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, shiftRes] = await Promise.all([
                fetch(`${apiUrl}/api/employees`, { credentials: 'include' }),
                fetch(`${apiUrl}/api/shifts`, { credentials: 'include' })
            ]);

            const empData = await empRes.json();
            const shiftData = await shiftRes.json();

            if (empData.success) setEmployees(empData.data);
            if (shiftData.success) setShifts(shiftData.data);
        } catch (error) {
            toast.error('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleShiftChange = async (employeeId, shiftId) => {
        try {
            const response = await fetch(`${apiUrl}/api/employees/${employeeId}/shift`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ shift: shiftId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('تم تحديث شفت الموظف بنجاح');
                fetchData();
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ في الشبكة');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                <Button
                    color="primary"
                    startContent={<FaSyncAlt />}
                    onClick={fetchData}
                >
                    تحديث البيانات
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" color="primary" />
                    <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    الموظف
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    القسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    الشفت الحالي
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    تغيير الشفت
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.length > 0 ? (
                                employees.map(employee => (
                                    <tr key={employee._id} className="hover:bg-blue-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="font-medium text-gray-900">{employee.name}</div>
                                            <div className="text-sm text-gray-500">{employee.position}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {employee.department ? (
                                                <Chip color="primary" variant="flat">{employee.department.name}</Chip>
                                            ) : (
                                                <Chip color="default" variant="flat">--</Chip>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {employee.shift ? (
                                                <div>
                                                    <div className="font-medium">{employee.shift.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {employee.shift.startTime} - {employee.shift.endTime}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Chip color="warning" variant="flat">غير معين</Chip>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Select
                                                size="sm"
                                                className="min-w-[200px]"
                                                selectedKeys={employee.shift ? [employee.shift._id] : []}
                                                onChange={(e) => handleShiftChange(employee._id, e.target.value)}
                                            >
                                                <SelectItem key="">لا شيء</SelectItem>
                                                {shifts.map(shift => (
                                                    <SelectItem key={shift._id} value={shift._id}>
                                                        {shift.name} ({shift.startTime} - {shift.endTime})
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaInfoCircle className="text-gray-400 text-4xl mb-3" />
                                            <p className="text-gray-500 text-lg">لا توجد بيانات للموظفين</p>
                                            <Button
                                                color="primary"
                                                variant="light"
                                                className="mt-4"
                                                onClick={fetchData}
                                            >
                                                تحديث البيانات
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <ToastContainer position="top-center" rtl={true} />
        </div>
    );
};

export default EmployeeShifts;