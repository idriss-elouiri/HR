'use client';
import { useState, useEffect } from 'react';
import EmployeesTable from './EmployeesTable';
import EmployeeForm from './EmployeeForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/employees`);
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            const data = await response.json();
            setEmployees(data.data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/api/employees/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('فشل في الحذف');

            toast.success('تم حذف الموظف بنجاح');
            fetchEmployees();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSubmitSuccess = () => {
        setFormOpen(false);
        fetchEmployees();
        toast.success(selectedEmployee ? 'تم تحديث بيانات الموظف' : 'تم إضافة موظف جديد');
    };

    return (
        <div className="container mx-auto p-4">
            <EmployeesTable
                data={employees}
                onEdit={(employee) => {
                    setSelectedEmployee(employee);
                    setFormOpen(true);
                }}
                onDelete={handleDelete} // تم التعديل هنا
                onRefresh={fetchEmployees}
                onAdd={() => {
                    setSelectedEmployee(null);
                    setFormOpen(true);
                }}
            />

            {formOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <EmployeeForm
                            employee={selectedEmployee}
                            onSuccess={handleSubmitSuccess}
                            onCancel={() => setFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" rtl={true} />
        </div>
    );
};

export default Employees;