'use client';
import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    FaEdit, FaTrash, FaPlus, FaSync,
    FaSearch, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const EmployeesTable = ({ data, onEdit, onDelete, onRefresh, onAdd, loading }) => {
    const handleDeleteClick = (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
            onDelete(id);
        }
    };

    const columns = useMemo(() => [
        {
            id: 'employeeId',
            header: 'رقم الموظف',
            accessorKey: 'employeeId',
        },
        {
            id: 'fullName',
            header: 'الاسم الكامل',
            accessorKey: 'fullName',
        },
        {
            id: 'fingerprintId',
            header: 'معرف البصمة',
            accessorKey: 'fingerprintId',
            cell: ({ row }) => {
                const value = row.original.fingerprintId;
                return value ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {value}
                    </span>
                ) : (
                    <span className="text-gray-500">---</span>
                );
            }
        },
        {
            id: 'department',
            header: 'القسم',
            accessorKey: 'department',
        },
        {
            id: 'jobTitle',
            header: 'المسمى الوظيفي',
            accessorKey: 'jobTitle',
        },
        {
            id: 'employmentStatus',
            header: 'حالة العمل',
            accessorKey: 'employmentStatus',
            cell: ({ getValue }) => (
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getValue() === 'نشط' ? 'bg-green-100 text-green-800' :
                    getValue() === 'موقوف' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {getValue()}
                </span>
            ),
        },
        {
            id: 'salary',
            header: 'الراتب',
            accessorKey: 'salary',
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-700">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(getValue())}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'الإجراءات',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="تعديل"
                    >
                        <FaEdit />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(row.original._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="حذف"
                    >
                        <FaTrash />
                    </motion.button>
                </div>
            ),
        },
        {
            id: 'rank',
            header: 'الرتبة',
            accessorKey: 'rank',
            cell: ({ getValue }) => getValue() || '---'
        },
        {
            id: 'appreciationLetters',
            header: 'كتب شكر',
            accessorKey: 'appreciationLetters',
            cell: ({ getValue }) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getValue() ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {getValue() ? 'نعم' : 'لا'}
                </span>
            )
        },
        {
            id: 'lastSalaryIncrease',
            header: 'آخر زيادة',
            accessorKey: 'lastSalaryIncrease',
            cell: ({ getValue }) => {
                const value = getValue();
                return value?.date ?
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{new Date(value.date).toLocaleDateString('ar-EG')}</span>
                        <span className="text-xs text-green-600">+{value.amount}</span>
                    </div>
                    : '---';
            }
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 8,
            },
        },
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold">قائمة الموظفين</h2>
                    <div className="flex flex-wrap gap-3">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onAdd}
                            className="bg-white text-blue-700 px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-shadow"
                        >
                            <FaPlus className="ml-2" /> إضافة موظف
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onRefresh}
                            className="bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-shadow"
                        >
                            <FaSync className="ml-2" /> تحديث
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6 relative max-w-md">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        placeholder="ابحث عن موظف..."
                        className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={e => table.setGlobalFilter(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                        <p className="mt-4 text-gray-600">جاري تحميل بيانات الموظفين...</p>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد بيانات متاحة
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <motion.tr
                                        key={row.id}
                                        className="hover:bg-gray-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            عرض
                        </span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm"
                        >
                            {[5, 8, 10, 20].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700">
                            صفوف
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <FaChevronLeft className="text-gray-600" />
                            </motion.button>

                            <span className="text-sm text-gray-700 min-w-[100px] text-center">
                                الصفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <FaChevronRight className="text-gray-600" />
                            </motion.button>
                        </div>

                        <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                            <span className="text-blue-700 font-medium text-sm">
                                {data.length} موظف
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EmployeesTable;