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
    FaPrint, FaFileAlt, FaFilter
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const SalariesTable = ({
    data = [],
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
    apiUrl,
    loading = false
}) => {
    const handleDeleteClick = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
            await onDelete(id);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'الشهر/السنة',
            accessorFn: (row) => `${row.month}/${row.year}`,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-700">{row.original.month}/{row.original.year}</span>
                    <span className="text-xs text-gray-500">
                        {row.original.employee?.department || 'غير محدد'}
                    </span>
                </div>
            ),
        },
        {
            header: 'الموظف',
            accessorFn: (row) => row.employee?.fullName || '---',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {row.original.employee?.fullName || '---'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.original.employee?.employeeId || '---'}
                    </span>
                </div>
            ),
        },
        {
            header: 'الراتب الأساسي',
            accessorKey: 'baseSalary',
            cell: ({ getValue }) => (
                <span className="font-bold text-gray-700">
                    {Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'البدلات',
            accessorFn: (row) => row.allowances.reduce((sum, a) => sum + a.amount, 0),
            cell: ({ getValue }) => (
                <span className="text-green-600 font-medium">
                    +{Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'الخصومات',
            accessorFn: (row) => (
                row.deductions.reduce((sum, d) => sum + d.amount, 0) +
                (row.socialInsurance?.amount || 0)
            ),
            cell: ({ getValue }) => (
                <span className="text-red-600 font-medium">
                    -{Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'الصافي',
            accessorKey: 'netSalary',
            cell: ({ getValue }) => (
                <span className="font-bold text-blue-600">
                    {Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'الحالة',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const statusClasses = {
                    'معتمدة': 'bg-green-100 text-green-800',
                    'مسددة': 'bg-blue-100 text-blue-800',
                    'ملغاة': 'bg-red-100 text-red-800',
                    'مسودة': 'bg-gray-100 text-gray-800'
                };

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[getValue()] || 'bg-gray-100 text-gray-800'}`}>
                        {getValue()}
                    </span>
                );
            },
            filterFn: 'equals',
        },
        {
            header: 'الإجراءات',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="تعديل"
                        aria-label="تعديل"
                    >
                        <FaEdit />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(row.original._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="حذف"
                        aria-label="حذف"
                    >
                        <FaTrash />
                    </motion.button>
                    <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={`${apiUrl}/api/salaries/${row.original._id}/payslip`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="طباعة"
                        aria-label="طباعة"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaPrint />
                    </motion.a>
                </div>
            ),
        },
    ], [apiUrl, onEdit]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
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
                    <div>
                        <h2 className="text-xl font-bold">سجل الرواتب</h2>
                        <p className="text-blue-100 mt-1">إدارة جميع رواتب الموظفين في مكان واحد</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onAdd}
                            className="bg-white text-blue-700 px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-shadow"
                            disabled={loading}
                        >
                            <FaPlus className="ml-2" /> {loading ? 'جاري التحميل...' : 'إضافة راتب'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onRefresh}
                            className="bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-shadow"
                            disabled={loading}
                        >
                            <FaSync className={`ml-2 ${loading ? 'animate-spin' : ''}`} /> تحديث
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            placeholder="ابحث عن راتب..."
                            className="pr-10 pl-4 py-3 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            onChange={(e) => table.setGlobalFilter(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="relative min-w-[180px]">
                        <select
                            className="appearance-none pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => {
                                const column = table.getColumn('status');
                                if (e.target.value === 'all') {
                                    column.setFilterValue(undefined);
                                } else {
                                    column.setFilterValue(e.target.value);
                                }
                            }}
                            disabled={loading}
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="مسودة">مسودة</option>
                            <option value="معتمدة">معتمدة</option>
                            <option value="مسددة">مسددة</option>
                            <option value="ملغاة">ملغاة</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaFilter className="text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
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
                                        <p className="mt-4 text-gray-600">جاري تحميل بيانات الرواتب...</p>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                        <FaFileAlt className="mx-auto text-3xl text-gray-300 mb-3" />
                                        <p className="text-gray-600">لا توجد بيانات متاحة</p>
                                        <button
                                            onClick={onAdd}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            إضافة راتب جديد
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <motion.tr
                                        key={row.id}
                                        className="hover:bg-gray-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
                            {[5, 10, 20, 30].map(pageSize => (
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
                                {data.length} راتب
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SalariesTable;