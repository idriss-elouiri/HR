'use client';
import { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Input,
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
    Chip,
    Tooltip,
    Badge
} from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaInfoCircle, FaBuilding, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const DepartmentsManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const rowsPerPage = 8;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/departments`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            } else {
                toast.error('فشل في جلب الأقسام');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب الأقسام');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) {
            toast.error('اسم القسم مطلوب');
            return;
        }

        const departmentData = { name, description };
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ?
            `${apiUrl}/api/departments/${editingId}` :
            `${apiUrl}/api/departments`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(departmentData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingId ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح');
                fetchDepartments();
                resetForm();
                setIsModalOpen(false);
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ في الشبكة');
        }
    };

    const handleEdit = (department) => {
        setName(department.name);
        setDescription(department.description || '');
        setEditingId(department._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الموظفين والبيانات المرتبطة به!')) {
            try {
                const response = await fetch(`${apiUrl}/api/departments/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('تم حذف القسم بنجاح');
                    fetchDepartments();
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
        setDescription('');
        setEditingId(null);
    };

    // Filter departments based on search term
    const filteredDepartments = useMemo(() => {
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [departments, searchTerm]);

    const paginatedDepartments = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredDepartments.slice(start, start + rowsPerPage);
    }, [filteredDepartments, page]);

    // إحصائيات سريعة
    const totalDepartments = departments.length;
    const departmentsWithEmployees = departments.filter(dept => dept.employeeCount > 0).length;

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
                            <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
                            <p className="text-indigo-100 mt-1">تنظيم أقسام الشركة وإدارتها بشكل فعال</p>
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
                                إضافة قسم جديد
                            </Button>
                        </motion.div>
                    </div>
                </div>

                <CardBody className="p-6">
                    {/* إحصائيات سريعة */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaBuilding className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">إجمالي الأقسام</p>
                                    <p className="text-2xl font-bold">{totalDepartments}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaUsers className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">أقسام بها موظفين</p>
                                    <p className="text-2xl font-bold">{departmentsWithEmployees}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                            <CardBody className="flex flex-row items-center p-4">
                                <div className="bg-white/20 p-3 rounded-full mr-3">
                                    <FaInfoCircle className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">أقسام بدون موظفين</p>
                                    <p className="text-2xl font-bold">{totalDepartments - departmentsWithEmployees}</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* شريط البحث */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Input
                            placeholder="ابحث عن قسم أو وصف..."
                            startContent={<FaSearch className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                            classNames={{
                                inputWrapper: "border border-gray-300 shadow-sm"
                            }}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner
                                size="lg"
                                classNames={{
                                    circle1: "border-b-indigo-600",
                                    circle2: "border-b-indigo-600",
                                }}
                            />
                            <span className="mt-4 text-lg text-gray-600 font-medium">جاري تحميل الأقسام...</span>
                        </div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-block p-5 bg-indigo-100 rounded-full mb-5">
                                <FaBuilding className="text-indigo-600 text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-800 mb-2">
                                لا توجد أقسام
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchTerm
                                    ? "لم يتم العثور على أقسام تطابق معايير البحث"
                                    : "لم يتم إضافة أي أقسام بعد. قم بإضافة قسم لبدء الإدارة"}
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
                                إضافة قسم جديد
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table
                                aria-label="قائمة الأقسام"
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
                                    <TableColumn className="text-center w-1/5">القسم</TableColumn>
                                    <TableColumn className="text-center w-1/4">الوصف</TableColumn>
                                    <TableColumn className="text-center w-1/5">عدد الموظفين</TableColumn>
                                    <TableColumn className="text-center w-1/5">تاريخ الإنشاء</TableColumn>
                                    <TableColumn className="text-center w-1/6">الإجراءات</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {paginatedDepartments.map((dept) => (
                                        <TableRow key={dept._id}>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <div className="bg-indigo-100 p-2 rounded-full mr-2">
                                                        <FaBuilding className="text-indigo-600" />
                                                    </div>
                                                    <span className="font-bold text-gray-800">{dept.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {dept.description ? (
                                                    <Tooltip content={dept.description}>
                                                        <div className="max-w-xs truncate text-gray-600">
                                                            {dept.description}
                                                        </div>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-gray-500">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    color={dept.employeeCount > 0 ? "success" : "warning"}
                                                    content={dept.employeeCount || 0}
                                                    placement="top-right"
                                                    shape="circle"
                                                >
                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                                        {dept.employeeCount || 0} موظف
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium">
                                                        {new Date(dept.createdAt).toLocaleDateString('ar-EG')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(dept.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Tooltip content="تعديل القسم" color="primary">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                                            onClick={() => handleEdit(dept)}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="حذف القسم" color="danger">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white"
                                                            onClick={() => handleDelete(dept._id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    page={page}
                                    total={Math.ceil(filteredDepartments.length / rowsPerPage)}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="lg"
                backdrop="blur"
                className="z-[1000]"
            >
                <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
                    <ModalHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                        <h2 className="text-xl font-bold">
                            {editingId ? 'تعديل القسم' : 'إضافة قسم جديد'}
                        </h2>
                    </ModalHeader>
                    <ModalBody className="p-6">
                        <div className="space-y-6">
                            <Input
                                autoFocus
                                placeholder='اسم القسم'
                                labelPlacement="outside"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isRequired
                                startContent={<FaBuilding className="text-indigo-500" />}
                                classNames={{
                                    inputWrapper: "p-0 border border-gray-300 shadow-sm"
                                }}
                            />
                            <Input
                                labelPlacement="outside"
                                placeholder="أدخل وصفًا للقسم"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                startContent={<FaInfoCircle className="text-indigo-500" />}
                                classNames={{
                                    inputWrapper: "border border-gray-300 shadow-sm"
                                }}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
                        <div className="flex justify-end space-x-3">
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
                                {editingId ? 'تحديث القسم' : 'إضافة القسم'}
                            </Button>
                        </div>
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

export default DepartmentsManagement;