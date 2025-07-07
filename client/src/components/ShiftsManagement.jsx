'use client';
import { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Card,
    CardBody,
    Chip
} from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus, FaClock, FaBuilding, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const ShiftsManagement = () => {
    const [shifts, setShifts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [page, setPage] = useState(1);
    const rowsPerPage = 8;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchShifts();
        fetchDepartments();
    }, []);

    const fetchShifts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/shifts`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setShifts(data.data);
            } else {
                toast.error('فشل في جلب الشفتات');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب الشفتات');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredShifts = shifts.filter(shift => {
        const matchesDepartment = departmentFilter ? shift.department?._id === departmentFilter : true;
        const matchesSearch = searchTerm ?
            shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (shift.department?.name && shift.department.name.toLowerCase().includes(searchTerm.toLowerCase())) : true;
        return matchesDepartment && matchesSearch;
    });

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/departments`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            }
        } catch (error) {
            console.error('حدث خطأ أثناء جلب الأقسام');
        }
    };

    const handleSubmit = async () => {
        if (!name || !startTime || !endTime) {
            toast.error('الاسم ووقت البداية والنهاية مطلوبة');
            return;
        }

        const shiftData = { name, startTime, endTime, description, department };
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ?
            `${apiUrl}/api/shifts/${editingId}` :
            `${apiUrl}/api/shifts`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(shiftData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingId ? 'تم تحديث الشفت بنجاح' : 'تم إضافة الشفت بنجاح');
                fetchShifts();
                resetForm();
                setIsModalOpen(false);
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ في الشبكة');
        }
    };

    const handleEdit = (shift) => {
        setName(shift.name);
        setStartTime(shift.startTime);
        setEndTime(shift.endTime);
        setDescription(shift.description || '');
        setDepartment(shift.department?._id || '');
        setEditingId(shift._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الشفت؟')) {
            try {
                const response = await fetch(`${apiUrl}/api/shifts/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('تم حذف الشفت بنجاح');
                    fetchShifts();
                } else {
                    toast.error(data.message || 'حدث خطأ أثناء الحذف');
                }
            } catch (error) {
                toast.error('حدث خطأ في الشبكة');
            }
        }
    };

    const resetForm = () => {
        setName('');
        setStartTime('');
        setEndTime('');
        setDescription('');
        setDepartment('');
        setEditingId(null);
    };

    const paginatedShifts = filteredShifts.slice(
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
                <CardBody className="p-0">
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">إدارة الشفتات</h1>
                                <p className="text-indigo-100 mt-1">إدارة وتنظيم الشفتات للموظفين والأقسام</p>
                            </div>

                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    color="primary"
                                    startContent={<FaPlus />}
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                                >
                                    إضافة شفت جديد
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                placeholder="ابحث عن اسم شفت أو قسم..."
                                startContent={<FaSearch className="text-gray-400" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-1/2"
                            />

                            <Select
                                label="فلترة حسب القسم"
                                selectedKeys={departmentFilter ? [departmentFilter] : []}
                                onSelectionChange={(keys) => setDepartmentFilter(keys.size > 0 ? [...keys][0] : '')}
                                className="w-full md:w-1/3"
                                startContent={<FaBuilding className="text-gray-400" />}
                            >
                                <SelectItem key="">جميع الأقسام</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Spinner
                                    size="lg"
                                    classNames={{
                                        circle1: "border-b-indigo-600",
                                        circle2: "border-b-indigo-600",
                                    }}
                                />
                                <span className="mr-2">جاري تحميل الشفتات...</span>
                            </div>
                        ) : filteredShifts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-block p-5 bg-indigo-100 rounded-full mb-5">
                                    <FaClock className="text-indigo-600 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-indigo-800 mb-2">
                                    لا توجد شفتات متاحة
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    {searchTerm || departmentFilter
                                        ? "لم يتم العثور على شفتات تطابق معايير البحث"
                                        : "لم يتم إضافة أي شفتات بعد. قم بإضافة شفت جديد لبدء الإدارة"}
                                </p>
                                <Button
                                    color="primary"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(true);
                                    }}
                                    startContent={<FaPlus />}
                                >
                                    إضافة شفت جديد
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Table
                                    aria-label="قائمة الشفتات"
                                    className="min-w-full rounded-lg overflow-hidden"
                                    fullWidth={true} // أضف هذه الخاصية
                                    classNames={{
                                        wrapper: "rounded-lg border border-gray-200 shadow-sm",
                                        th: "bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 font-bold border-b border-gray-200 py-4",
                                        td: "border-b border-gray-100 py-3",
                                        tr: "hover:bg-indigo-50 transition-colors"
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn className="text-center w-1/4">اسم الشفت</TableColumn>
                                        <TableColumn className="text-center w-1/4">القسم</TableColumn>
                                        <TableColumn className="text-center w-1/4">الوقت</TableColumn>
                                        <TableColumn className="text-center w-1/6">الإجراءات</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedShifts.map((shift) => (
                                            <TableRow key={shift._id}>
                                                <TableCell>
                                                    <div className="flex items-center justify-center">
                                                        <div className="bg-indigo-100 p-2 rounded-full mr-2">
                                                            <FaClock className="text-indigo-600" />
                                                        </div>
                                                        <span className="font-bold text-gray-800">{shift.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {shift.department ? (
                                                        <Chip
                                                            variant="flat"
                                                            color="primary"
                                                            startContent={<FaBuilding className="text-xs mr-1" />}
                                                        >
                                                            {shift.department.name}
                                                        </Chip>
                                                    ) : (
                                                        <span className="text-gray-500">--</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full">
                                                        <span className="font-bold text-blue-700">{shift.startTime}</span>
                                                        <span className="mx-2 text-gray-500">→</span>
                                                        <span className="font-bold text-indigo-700">{shift.endTime}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                                            onClick={() => handleEdit(shift)}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white"
                                                            onClick={() => handleDelete(shift._id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        page={page}
                                        total={Math.ceil(filteredShifts.length / rowsPerPage)}
                                        onChange={setPage}
                                        classNames={{
                                            item: "bg-white",
                                            cursor: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </CardBody>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="lg"
                backdrop="blur"

            >
                <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
                    <ModalHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                        {editingId ? 'تعديل الشفت' : 'إضافة شفت جديد'}
                    </ModalHeader>
                    <ModalBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                            <Input
                                labelPlacement="outside"
                                placeholder="أدخل اسم الشفت"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isRequired
                                startContent={<FaClock className="text-indigo-500" />}
                                classNames={{
                                    inputWrapper: "border border-gray-300 shadow-sm"
                                }}
                            />

                            <Select
                                labelPlacement="outside"
                                placeholder="اختر القسم"
                                selectedKeys={department ? [department] : []}
                                onSelectionChange={(keys) => setDepartment(keys.size > 0 ? [...keys][0] : '')}
                                startContent={<FaBuilding className="text-indigo-500" />}
                                classNames={{
                                    trigger: "border border-gray-300 shadow-sm"
                                }}
                            >
                                <SelectItem key="">اختر القسم</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                labelPlacement="outside"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                isRequired
                                startContent={<span className="text-gray-500">بداية</span>}
                                classNames={{
                                    inputWrapper: "border border-gray-300 shadow-sm"
                                }}
                            />

                            <Input
                                labelPlacement="outside"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                isRequired
                                startContent={<span className="text-gray-500">نهاية</span>}
                                classNames={{
                                    inputWrapper: "border border-gray-300 shadow-sm"
                                }}
                            />

                            <div className="md:col-span-2">
                                <Input
                                    labelPlacement="outside"
                                    placeholder="أدخل وصفًا للشفت"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    classNames={{
                                        inputWrapper: "border border-gray-300 shadow-sm"
                                    }}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="default"
                            variant="light"
                            onClick={() => setIsModalOpen(false)}
                            className="border border-gray-300"
                        >
                            إلغاء
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        >
                            {editingId ? 'تحديث الشفت' : 'إضافة الشفت'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <ToastContainer
                position="top-center"
                rtl={true}
                toastClassName="font-sans"
                progressClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
        </motion.div>
    );
};

export default ShiftsManagement;