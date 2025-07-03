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
    ModalFooter
} from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
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
    const filteredShifts = departmentFilter
        ? shifts.filter(shift => shift.department?._id === departmentFilter)
        : shifts;
        
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

    const paginatedShifts = shifts.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                <Button
                    color="primary"
                    startContent={<FaPlus />}
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    إضافة شفت جديد
                </Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
                <ModalContent>
                    <ModalHeader className="border-b">
                        {editingId ? 'تعديل الشفت' : 'إضافة شفت جديد'}
                    </ModalHeader>
                    <ModalBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <Input
                                label="اسم الشفت"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isRequired
                            />

                            <Select
                                label="القسم (اختياري)"
                                selectedKeys={department ? [department] : []}
                                onSelectionChange={(keys) => setDepartment(keys.size > 0 ? [...keys][0] : '')}
                            >
                                <SelectItem key="">اختر القسم</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                label="وقت البداية"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                isRequired
                            />

                            <Input
                                label="وقت النهاية"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                isRequired
                            />

                            <div className="md:col-span-2">
                                <Input
                                    label="الوصف (اختياري)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onClick={() => setIsModalOpen(false)}>
                            إلغاء
                        </Button>
                        <Button color="primary" onClick={handleSubmit}>
                            {editingId ? 'تحديث' : 'حفظ'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <>
                        <Table aria-label="قائمة الشفتات" className="min-w-full">
                            <TableHeader>
                                <TableColumn>الاسم</TableColumn>
                                <TableColumn>القسم</TableColumn>
                                <TableColumn>وقت البداية</TableColumn>
                                <TableColumn>وقت النهاية</TableColumn>
                                <TableColumn>الإجراءات</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {paginatedShifts.map((shift) => (
                                    <TableRow key={shift._id}>
                                        <TableCell className="font-semibold">{shift.name}</TableCell>
                                        <TableCell>{shift.department?.name || '--'}</TableCell>
                                        <TableCell>{shift.startTime}</TableCell>
                                        <TableCell>{shift.startTime} → {shift.endTime}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="primary"
                                                    onClick={() => handleEdit(shift)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
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
                        <div className="flex justify-center mt-4">
                            <Pagination
                                page={page}
                                total={Math.ceil(shifts.length / rowsPerPage)}
                                onChange={setPage}
                            />
                        </div>
                    </>
                )}
            </div>
            <ToastContainer position="top-center" rtl={true} />
        </div>
    );
};

export default ShiftsManagement;