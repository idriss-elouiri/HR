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
    Tooltip
} from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DepartmentsManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const rowsPerPage = 10;
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
        if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
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

    return (
        <div className="space-y-6">
            <Card className="shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardBody>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Input
                                placeholder="ابحث عن قسم..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startContent={<FaSearch className="text-gray-400" />}
                                classNames={{
                                    input: "pr-8"
                                }}
                            />
                            {searchTerm && (
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    className="absolute right-2 top-2"
                                    onClick={() => setSearchTerm('')}
                                >
                                    &times;
                                </Button>
                            )}
                        </div>

                        <Button
                            color="primary"
                            startContent={<FaPlus />}
                            className="md:self-end"
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                        >
                            إضافة قسم جديد
                        </Button>
                    </div>
                </CardBody>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                placement="center"
                backdrop="blur"
                className="z-[1000] max-h-[90vh] overflow-auto"
            >
                <ModalContent className="bg-white rounded-xl shadow-2xl border border-gray-200">
                    <ModalHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                        <h2 className="text-xl font-bold">
                            {editingId ? 'تعديل القسم' : 'إضافة قسم جديد'}
                        </h2>
                    </ModalHeader>
                    <ModalBody className="p-6">
                        <div className="space-y-6">
                            <Input
                                autoFocus
                                label="اسم القسم"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    label: "text-gray-700 font-medium",
                                    input: "text-right"
                                }}
                            />
                            <Input
                                label="الوصف (اختياري)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                variant="bordered"
                                classNames={{
                                    label: "text-gray-700 font-medium",
                                    input: "text-right"
                                }}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-gray-50 p-6 rounded-b-xl border-t border-gray-200">
                        <div className="flex justify-end space-x-3">
                            <Button
                                color="default"
                                variant="light"
                                onClick={() => setIsModalOpen(false)}
                                className="font-medium px-6 py-2"
                            >
                                إلغاء
                            </Button>
                            <Button
                                color="primary"
                                onClick={handleSubmit}
                                className="font-medium px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            >
                                {editingId ? 'تحديث' : 'حفظ'}
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                <CardBody className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" color="primary" />
                            <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider rounded-tl-xl">
                                                الاسم
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                الوصف
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                تاريخ الإنشاء
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider rounded-tr-xl">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedDepartments.length > 0 ? (
                                            paginatedDepartments.map((dept) => (
                                                <tr key={dept._id} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="font-semibold text-blue-700">{dept.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        {dept.description ? (
                                                            <Tooltip content={dept.description}>
                                                                <div className="max-w-xs truncate">
                                                                    {dept.description}
                                                                </div>
                                                            </Tooltip>
                                                        ) : (
                                                            <Chip color="default" variant="flat">--</Chip>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {new Date(dept.createdAt).toLocaleDateString('ar-EG')}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(dept.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Tooltip content="تعديل">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    onClick={() => handleEdit(dept)}
                                                                >
                                                                    <FaEdit />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="حذف">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    color="danger"
                                                                    variant="flat"
                                                                    onClick={() => handleDelete(dept._id)}
                                                                >
                                                                    <FaTrash />
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FaFilter className="text-gray-400 text-4xl mb-3" />
                                                        <p className="text-gray-500 text-lg">لا توجد أقسام</p>
                                                        {searchTerm && (
                                                            <p className="text-gray-400 mt-2">
                                                                لا توجد نتائج لـ "{searchTerm}"
                                                            </p>
                                                        )}
                                                        <Button
                                                            color="primary"
                                                            variant="light"
                                                            className="mt-4"
                                                            onClick={() => {
                                                                resetForm();
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            إضافة قسم جديد
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {filteredDepartments.length > rowsPerPage && (
                                <div className="flex justify-center p-4 border-t border-gray-100">
                                    <Pagination
                                        page={page}
                                        total={Math.ceil(filteredDepartments.length / rowsPerPage)}
                                        onChange={setPage}
                                        color="primary"
                                        showControls
                                        classNames={{
                                            cursor: "bg-blue-600"
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            <ToastContainer
                position="top-center"
                rtl={true}
                theme="colored"
                toastStyle={{
                    borderRadius: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 500
                }}
            />
        </div>
    );
};

export default DepartmentsManagement;