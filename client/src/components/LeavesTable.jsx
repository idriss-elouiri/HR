// components/LeavesTable.js
'use client';
import { useMemo, useState } from 'react';
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
  FaCalendarAlt, FaUser, FaFilter, FaEllipsisV
} from 'react-icons/fa';

const LeavesTable = ({ data, onEdit, onDelete, onRefresh, onAdd }) => {
  const [statusFilter, setStatusFilter] = useState('الكل');

  const statusOptions = ['الكل', 'معلقة', 'موافق عليها', 'مرفوضة', 'ملغاة'];

  const columns = useMemo(() => [
    {
      header: 'الموظف',
      accessorFn: (row) => row.employee?.fullName || '---',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2">
            <FaUser className="text-white text-sm" />
          </div>
          <span className="font-medium">{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'نوع الإجازة',
      accessorKey: 'type',
      cell: ({ getValue }) => (
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
          {getValue()}
        </div>
      ),
    },
    {
      header: 'الفترة',
      accessorFn: (row) => `${row.startDate ? new Date(row.startDate).toLocaleDateString('ar-EG') : ''} - ${row.endDate ? new Date(row.endDate).toLocaleDateString('ar-EG') : ''}`,
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <FaCalendarAlt className="ml-2 text-indigo-500" />
          <span className="text-gray-700">{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'المدة (أيام)',
      accessorKey: 'duration',
      cell: ({ getValue }) => (
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-center font-bold inline-block">
          {getValue()}
        </div>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const statusClasses = {
          'معلقة': 'bg-yellow-100 text-yellow-800 border-yellow-300',
          'موافق عليها': 'bg-green-100 text-green-800 border-green-300',
          'مرفوضة': 'bg-red-100 text-red-800 border-red-300',
          'ملغاة': 'bg-gray-100 text-gray-800 border-gray-300'
        };

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[getValue()] || 'bg-gray-100 text-gray-800'}`}>
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
            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-all"
            title="تعديل"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(row.original._id)}
            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all"
            title="حذف"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      ),
    }
  ], []);

  // Filter data based on status
  const filteredData = statusFilter === 'الكل'
    ? data
    : data.filter(item => item.status === statusFilter);

  const table = useReactTable({
    data: filteredData,
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">قائمة الإجازات</h2>
            <p className="text-indigo-200 mt-1">إدارة جميع إجازات الموظفين في مكان واحد</p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={onAdd}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-xl flex items-center font-medium shadow-md transition-all"
            >
              <FaPlus className="ml-2" /> إضافة إجازة
            </button>
            <button
              onClick={onRefresh}
              className="bg-indigo-800 text-white hover:bg-indigo-900 px-5 py-2.5 rounded-xl flex items-center font-medium shadow-md transition-all"
            >
              <FaSync className="ml-2" /> تحديث
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              placeholder="بحث في الإجازات..."
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              onChange={e => table.setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-300">
              <FaFilter className="text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium mr-2">فلتر:</span>
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 mx-1 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                        <FaSearch className="text-gray-500 text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">لا توجد بيانات</h3>
                      <p className="text-gray-500 mt-1">لم يتم العثور على إجازات تطابق معايير البحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            عرض {table.getRowModel().rows.length} من أصل {filteredData.length} إجازة
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-all"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <FaChevronLeft className="text-gray-700" />
            </button>

            <div className="flex space-x-1">
              {[...Array(table.getPageCount())].map((_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-full text-sm ${table.getState().pagination.pageIndex === i
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-all"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <FaChevronRight className="text-gray-700" />
            </button>
          </div>

          <div className="mt-4 sm:mt-0 text-sm text-gray-600">
            الصفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesTable;