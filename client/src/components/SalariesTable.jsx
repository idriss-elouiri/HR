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
    FaMoneyBillWave, FaPrint, FaFileAlt, FaFilter
} from 'react-icons/fa';
import Link from 'next/link';

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
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue()}</span>
            ),
        },
        {
            header: 'الموظف',
            accessorFn: (row) => row.employee?.fullName || '---',
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue()}</span>
            ),
        },
        {
            header: 'الراتب الأساسي',
            accessorKey: 'baseSalary',
            cell: ({ getValue }) => (
                <span className="font-bold">{Number(getValue()).toLocaleString('ar-SA', {
                    style: 'currency',
                    currency: 'SAR',
                    minimumFractionDigits: 2
                })}</span>
            ),
        },
        {
            header: 'إجمالي البدلات',
            accessorFn: (row) => row.allowances.reduce((sum, a) => sum + a.amount, 0),
            cell: ({ getValue }) => (
                <span className="text-green-600 font-medium">
                    {Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'إجمالي الخصومات',
            accessorFn: (row) => (
                row.deductions.reduce((sum, d) => sum + d.amount, 0) +
                (row.socialInsurance?.amount || 0)
            ),
            cell: ({ getValue }) => (
                <span className="text-red-600 font-medium">
                    {Number(getValue()).toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2
                    })}
                </span>
            ),
        },
        {
            header: 'الراتب الصافي',
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
                    <span className={`px-3 py-1 rounded-full text-sm ${statusClasses[getValue()] || 'bg-gray-100 text-gray-800'}`}>
                        {getValue()}
                    </span>
                );
            },
            filterFn: 'equals',
        },
        {
            header: 'الإجراءات',
            cell: ({ row }) => (
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                        onClick={() => onEdit(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="تعديل"
                        aria-label="تعديل"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.original._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="حذف"
                        aria-label="حذف"
                    >
                        <FaTrash />
                    </button>
                    <Link
                        href={`${apiUrl}/api/salaries/${row.original._id}/payslip`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="طباعة"
                        aria-label="طباعة"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaPrint />
                    </Link>
                </div>
            ),
        },
    ], [apiUrl]);

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
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaMoneyBillWave className="ml-2" />
                    سجل الرواتب
                </h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                        disabled={loading}
                    >
                        <FaPlus className="ml-2" />
                        {loading ? 'جاري التحميل...' : 'إضافة راتب'}
                    </button>
                    <button
                        onClick={onRefresh}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center transition-colors"
                        disabled={loading}
                    >
                        <FaSync className={`ml-2 ${loading ? 'animate-spin' : ''}`} />
                        تحديث
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        placeholder="بحث في جميع الحقول..."
                        className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => table.setGlobalFilter(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="relative">
                    <select
                        className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                                    {loading ? 'جاري تحميل البيانات...' : 'لا توجد بيانات متاحة'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="الصفحة الأولى"
                    >
                        <span className="sr-only">الصفحة الأولى</span>
                        <FaChevronLeft className="transform rotate-180" />
                        <FaChevronLeft className="transform rotate-180 -ml-1" />
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="الصفحة السابقة"
                    >
                        <FaChevronLeft className="transform rotate-180" />
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="الصفحة التالية"
                    >
                        <FaChevronRight className="transform rotate-180" />
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        aria-label="الصفحة الأخيرة"
                    >
                        <span className="sr-only">الصفحة الأخيرة</span>
                        <FaChevronRight className="transform rotate-180" />
                        <FaChevronRight className="transform rotate-180 -ml-1" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">
                        الصفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">عدد الصفوف:</span>
                        <select
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                        >
                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalariesTable