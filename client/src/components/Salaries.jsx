"use client"

import { useState, useEffect } from 'react';
import SalariesTable from './SalariesTable';
import SalaryForm from './SalaryForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Salaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/salaries`, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            const data = await response.json();
            setSalaries(data.data || data || []); // تعديل هنا للتعامل مع هيكلين مختلفين للبيانات
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, []);

    const handleSubmitSuccess = () => {
        setFormOpen(false);
        fetchSalaries();
        toast.success(selectedSalary ? 'تم تحديث بيانات الراتب' : 'تم إضافة راتب جديد');
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/api/salaries/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('فشل في الحذف');

            toast.success('تم حذف سجل الراتب بنجاح');
            fetchSalaries();
        } catch (err) {
            toast.error(err.message);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <SalariesTable
                data={salaries || []} // تأكد من تمرير مصفوفة فارغة إذا كانت salaries غير معرّفة
                onEdit={(salary) => {
                    setSelectedSalary(salary);
                    setSelectedEmployee(salary.employee);
                    setFormOpen(true);
                }}
                onDelete={handleDelete}
                onRefresh={fetchSalaries}
                onAdd={() => {
                    setSelectedSalary(null);
                    setSelectedEmployee(null);
                    setFormOpen(true);
                }}
                apiUrl={apiUrl}
            />

            {formOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <SalaryForm
                            employee={selectedEmployee}
                            salary={selectedSalary}
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

export default Salaries;