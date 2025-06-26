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

const EmployeesTable = ({ data, onEdit, onDelete, onRefresh, onAdd }) => {
    const handleDeleteClick = (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
            onDelete(id);
        }
    };

    const columns = useMemo(() => [
        {
            id: 'employeeId', // Add this
            header: 'رقم الموظف',
            accessorKey: 'employeeId',
        },
        {
            id: 'fullName', // Add this
            header: 'الاسم الكامل',
            accessorKey: 'fullName',
        },
        {
            id: 'department', // Add this
            header: 'القسم',
            accessorKey: 'department',
        },
        {
            id: 'jobTitle', // Add this
            header: 'المسمى الوظيفي',
            accessorKey: 'jobTitle',
        },
        {
            id: 'employmentStatus', // Add this
            header: 'حالة العمل',
            accessorKey: 'employmentStatus',
            cell: ({ getValue }) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getValue() === 'نشط' ? 'bg-green-100 text-green-800' :
                    getValue() === 'موقوف' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {getValue()}
                </span>
            ),
        },
        {
            id: 'actions', // Add this
            header: 'الإجراءات',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.original._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
        {
            id: 'rank', // Add this
            header: 'الرتبة', // Changed from 'Header' to 'header' for consistency
            accessorKey: 'rank', // Changed from 'accessor' to 'accessorKey' for consistency
            cell: ({ getValue }) => getValue() || '---' // Changed to use getValue()
        },
        {
            id: 'appreciationLetters', // Add this
            header: 'كتب شكر', // Changed from 'Header' to 'header'
            accessorKey: 'appreciationLetters', // Changed from 'accessor' to 'accessorKey'
            cell: ({ getValue }) => getValue() ? 'نعم' : 'لا' // Changed to use getValue()
        },
        {
            id: 'lastSalaryIncrease', // Add this
            header: 'آخر زيادة', // Changed from 'Header' to 'header'
            accessorKey: 'lastSalaryIncrease', // Changed from 'accessor' to 'accessorKey'
            cell: ({ getValue }) => {
                const value = getValue();
                return value?.date ?
                    `${new Date(value.date).toLocaleDateString('ar-EG')} (${value.amount})`
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
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">قائمة الموظفين</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={onAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <FaPlus className="ml-2" /> إضافة موظف
                    </button>
                    <button
                        onClick={onRefresh}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                    >
                        <FaSync className="ml-2" /> تحديث
                    </button>
                </div>
            </div>

            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    placeholder="بحث..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-1/3"
                    onChange={e => table.setGlobalFilter(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
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
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                    <button
                        className="px-3 py-1 border rounded-md"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        className="px-3 py-1 border rounded-md"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <FaChevronRight />
                    </button>
                </div>
                <span className="text-sm text-gray-700">
                    الصفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                </span>
            </div>
        </div>
    );
};

export default EmployeesTable;