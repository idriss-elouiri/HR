'use client';

import { useState, useEffect } from 'react';
import {
    Select, SelectItem, Button, Spinner, Chip, Tooltip,
    Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Pagination, Input, Badge
} from "@nextui-org/react";
import { FaSyncAlt, FaInfoCircle, FaUser, FaClock, FaBuilding, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeShifts = () => {
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [shiftFilter, setShiftFilter] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 8;
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

                // البحث عن كائن الشفت الكامل في حالة shifts
                const updatedShift = shifts.find(s => s._id === shiftId);

                setEmployees(prevEmployees =>
                    prevEmployees.map(emp =>
                        emp._id === employeeId ? {
                            ...emp,
                            shift: updatedShift || shiftId // استخدم الكائن إن وجد، أو الـ ID كبديل
                        } : emp
                    )
                );
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ في الشبكة');
        }
    };


    // التعديل 2: تعديل شروط الفلترة لاستخدام القيم النصية مباشرة
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = searchTerm ?
            employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.jobTitle && employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) : true;

        const matchesDepartment = departmentFilter ?
            employee.department === departmentFilter : true;

        const matchesShift = shiftFilter ?
            (employee.shift?._id === shiftFilter) : true;

        return matchesSearch && matchesDepartment && matchesShift;
    });


    // إحصائيات سريعة
    const totalEmployees = employees.length;
    const employeesWithShift = employees.filter(e => e.shift).length;
    const employeesWithoutShift = totalEmployees - employeesWithShift;

    // الحصول على الأقسام الفريدة
    const uniqueDepartments = [...new Set(employees
        .filter(e => e.department)
        .map(e => e.department))
    ];

    const paginatedEmployees = filteredEmployees.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6"
        >
            <Card className="rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">إدارة شفتات الموظفين</h1>
                            <p className="text-indigo-100 mt-1">إدارة وتوزيع الشفتات على الموظفين حسب الأقسام</p>
                        </div>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                color="primary"
                                startContent={<FaSyncAlt />}
                                onClick={fetchData}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                            >
                                تحديث البيانات
                            </Button>
                        </motion.div>
                    </div>
                </div>

                <CardBody className="p-6">
                    {/* إحصائيات سريعة */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaUser className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">إجمالي الموظفين</p>
                                    <p className="text-2xl font-bold">{totalEmployees}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaClock className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">موظفين بشفت</p>
                                    <p className="text-2xl font-bold">{employeesWithShift}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaInfoCircle className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">بدون شفت</p>
                                    <p className="text-2xl font-bold">{employeesWithoutShift}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaBuilding className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">إجمالي الشفتات</p>
                                    <p className="text-2xl font-bold">{shifts.length}</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* شريط البحث والفلاتر */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Input
                            placeholder="ابحث عن موظف أو وظيفة..."
                            startContent={<FaSearch className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3"
                        />

                        <Select
                            label="فلترة حسب القسم"
                            selectedKeys={departmentFilter ? [departmentFilter] : []}
                            onSelectionChange={(keys) => setDepartmentFilter(keys.size > 0 ? [...keys][0] : '')}
                            className="w-full md:w-1/4"
                            startContent={<FaBuilding className="text-gray-400" />}
                        >
                            <SelectItem key="">جميع الأقسام</SelectItem>
                            {uniqueDepartments.map((dept, index) => (
                                <SelectItem key={dept} value={dept}>
                                    {dept}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="فلترة حسب الشفت"
                            selectedKeys={shiftFilter ? [shiftFilter] : []}
                            onSelectionChange={(keys) => setShiftFilter(keys.size > 0 ? [...keys][0] : '')}
                            className="w-full md:w-1/4"
                            startContent={<FaClock className="text-gray-400" />}
                        >
                            <SelectItem key="">جميع الشفتات</SelectItem>
                            {shifts.map(shift => (
                                <SelectItem key={shift._id} value={shift._id}>
                                    {shift.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner
                                size="lg"
                                classNames={{
                                    circle1: "border-b-indigo-600",
                                    circle2: "border-b-indigo-600",
                                }}
                            />
                            <span className="mt-4 text-lg text-gray-600 font-medium">جاري تحميل بيانات الموظفين...</span>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-block p-5 bg-indigo-100 rounded-full mb-5">
                                <FaUser className="text-indigo-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-800 mb-2">
                                لا توجد نتائج
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchTerm || departmentFilter || shiftFilter
                                    ? "لم يتم العثور على موظفين تطابق معايير البحث"
                                    : "لم يتم إضافة أي موظفين بعد."}
                            </p>
                            <Button
                                color="primary"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                onClick={() => {
                                    setSearchTerm('');
                                    setDepartmentFilter('');
                                    setShiftFilter('');
                                }}
                                startContent={<FaSearch />}
                            >
                                عرض جميع الموظفين
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table
                                aria-label="قائمة الموظفين"
                                className="min-w-full rounded-lg overflow-hidden"
                                classNames={{
                                    wrapper: "rounded-lg border border-gray-200 shadow-sm",
                                    th: "bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 font-bold border-b border-gray-200",
                                    td: "border-b border-gray-100",
                                    tr: "hover:bg-indigo-50 transition-colors"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn className="text-center">الموظف</TableColumn>
                                    <TableColumn className="text-center">القسم</TableColumn>
                                    <TableColumn className="text-center">الوظيفة</TableColumn>
                                    <TableColumn className="text-center">الشفت الحالي</TableColumn>
                                    <TableColumn className="text-center">تغيير الشفت</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {paginatedEmployees.map(employee => (
                                        <TableRow key={employee._id}>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <div className="bg-indigo-100 p-2 rounded-full mr-2">
                                                        <FaUser className="text-indigo-600" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-gray-800 block">{employee.name}</span>
                                                        <span className="text-xs text-gray-500">{employee.employeeId || '--'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {employee.department ? (
                                                    <Chip
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<FaBuilding className="text-xs mr-1" />}
                                                    >
                                                        {employee.department}
                                                    </Chip>
                                                ) : (
                                                    <Badge color="warning" variant="flat" content="بدون قسم">
                                                        <span className="text-gray-500">--</span>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                                    {employee.jobTitle || '--'}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                {employee.shift ? (
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="font-bold text-indigo-700">
                                                            {typeof employee.shift === 'object'
                                                                ? employee.shift.name
                                                                : shifts.find(s => s._id === employee.shift)?.name || 'تحميل...'}
                                                        </span>
                                                        <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-1 rounded-full mt-1">
                                                            {typeof employee.shift === 'object'
                                                                ? `${employee.shift.startTime} → ${employee.shift.endTime}`
                                                                : (() => {
                                                                    const shiftObj = shifts.find(s => s._id === employee.shift);
                                                                    return shiftObj ? `${shiftObj.startTime} → ${shiftObj.endTime}` : 'تحميل...';
                                                                })()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge color="danger" variant="flat">
                                                        غير معين
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Select
                                                    size="sm"
                                                    className="min-w-[200px]"
                                                    selectedKeys={employee.shift ? [employee.shift._id] : []}
                                                    onChange={(e) => handleShiftChange(employee._id, e.target.value)}
                                                    classNames={{ trigger: "border border-gray-300 shadow-sm" }}
                                                >
                                                    <SelectItem key="">لا شيء</SelectItem>
                                                    {shifts.map(shift => (
                                                        <SelectItem
                                                            key={shift._id}
                                                            value={shift._id}
                                                            startContent={<FaClock className="text-indigo-500 text-sm" />}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span>{shift.name}</span>
                                                                <span className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    page={page}
                                    total={Math.ceil(filteredEmployees.length / rowsPerPage)}
                                    onChange={setPage}
                                    classNames={{
                                        item: "bg-white",
                                        cursor: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    }}
                                />
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>

            <ToastContainer
                position="top-center"
                rtl={true}
                toastClassName="font-sans"
                progressClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
        </motion.div>
    );
};

export default EmployeeShifts;