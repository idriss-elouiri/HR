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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        نظام إدارة الموظفين
                    </h1>
                    <p className="text-gray-600 mt-2">
                        إدارة بيانات الموظفين بكل سهولة واحترافية
                    </p>
                </div>

                <EmployeesTable
                    data={employees}
                    loading={loading}
                    onEdit={(employee) => {
                        setSelectedEmployee(employee);
                        setFormOpen(true);
                    }}
                    onDelete={handleDelete}
                    onRefresh={fetchEmployees}
                    onAdd={() => {
                        setSelectedEmployee(null);
                        setFormOpen(true);
                    }}
                />

                {formOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-blue-800">
                                    {selectedEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                                </h2>
                                <button 
                                    onClick={() => setFormOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <EmployeeForm
                                employee={selectedEmployee}
                                onSuccess={handleSubmitSuccess}
                                onCancel={() => setFormOpen(false)}
                            />
                        </div>
                    </div>
                )}

                <ToastContainer 
                    position="top-center" 
                    rtl={true} 
                    toastClassName="!bg-white !text-gray-800 !shadow-lg !rounded-xl !border !border-gray-200"
                    progressClassName="!bg-gradient-to-r !from-blue-500 !to-indigo-600"
                />
            </div>
        </div>
    );
};

export default Employees;