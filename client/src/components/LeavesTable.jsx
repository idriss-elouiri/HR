// components/LeavesTable.js
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
  FaCalendarAlt, FaUser
} from 'react-icons/fa';

const LeavesTable = ({ data, onEdit, onDelete, onRefresh, onAdd }) => {
  const columns = useMemo(() => [
    {
      header: 'الموظف',
      accessorFn: (row) => row.employee?.fullName || '---',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <FaUser className="ml-2 text-gray-500" />
          <span>{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'نوع الإجازة',
      accessorKey: 'type',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue()}</span>
      ),
    },
    {
      header: 'الفترة',
      accessorFn: (row) => `${row.startDate ? new Date(row.startDate).toLocaleDateString('ar-EG') : ''} - ${row.endDate ? new Date(row.endDate).toLocaleDateString('ar-EG') : ''}`,
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <FaCalendarAlt className="ml-2 text-gray-500" />
          <span>{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'المدة (أيام)',
      accessorKey: 'duration',
      cell: ({ getValue }) => (
        <span className="font-bold">{getValue()}</span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const statusClasses = {
          'معلقة': 'bg-yellow-100 text-yellow-800',
          'موافق عليها': 'bg-green-100 text-green-800',
          'مرفوضة': 'bg-red-100 text-red-800',
          'ملغاة': 'bg-gray-100 text-gray-800'
        };

        return (
          <span className={`px-3 py-1 rounded-full text-sm ${statusClasses[getValue()] || 'bg-gray-100 text-gray-800'}`}>
            {getValue()}
          </span>
        );
      }
    },
    {
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="تعديل"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.original._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="حذف"
          >
            <FaTrash />
          </button>
        </div>
      ),
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
        pageSize: 10,
      },
    },
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">قائمة الإجازات</h2>
        <div className="flex space-x-3">
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="ml-2" /> إضافة إجازة
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

export default LeavesTable;