// components/AbsencesTable.js
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
  FaCalendarAlt, FaUser, FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const AbsencesTable = ({ data, onEdit, onDelete, onRefresh, onAdd }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const columns = useMemo(() => [
    {
      header: 'الموظف',
      accessorFn: (row) => row.employee?.fullName || '---',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-2">
            <FaUser className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'نوع الغياب',
      accessorKey: 'type',
      cell: ({ getValue }) => (
        <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700">
          {getValue()}
        </span>
      ),
    },
    {
      header: 'التاريخ',
      accessorKey: 'date',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-2">
            <FaCalendarAlt className="text-purple-600" />
          </div>
          <span className="text-gray-700">{new Date(getValue()).toLocaleDateString('ar-EG')}</span>
        </div>
      ),
    },
    {
      header: 'المدة (ساعات)',
      accessorKey: 'duration',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-2">
            <FaClock className="text-amber-600" />
          </div>
          <span className="font-semibold text-gray-800">{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const statusClasses = {
          'معلقة': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
          'موافق عليها': 'bg-green-100 text-green-800 border border-green-300',
          'مرفوضة': 'bg-red-100 text-red-800 border border-red-300',
          'ملغاة': 'bg-gray-100 text-gray-800 border border-gray-300'
        };

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[getValue()] || 'bg-gray-100 text-gray-800'}`}>
            {getValue()}
          </span>
        );
      }
    },
    {
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(row.original)}
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-sm"
            title="تعديل"
          >
            <FaEdit />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(row.original._id)}
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-sm"
            title="حذف"
          >
            <FaTrash />
          </motion.button>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">قائمة الغياب والتأخير</h2>
          <p className="text-gray-600 mt-1">إدارة سجلات الغياب والتأخير للموظفين</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> إضافة غياب
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
          >
            <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} /> تحديث
          </motion.button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          placeholder="ابحث عن اسم موظف أو نوع غياب..."
          className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full bg-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
          onChange={e => table.setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-right text-sm font-semibold"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FaSearch className="text-gray-500 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">لا توجد بيانات</h3>
          <p className="mt-1 text-gray-500">لم يتم العثور على أي سجلات للغياب</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-600">
          عرض {table.getRowModel().rows.length} من أصل {data.length} سجل
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FaChevronRight className="text-gray-600" />
          </motion.button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const pageIndex = table.getState().pagination.pageIndex;
              let pageNum = i;
              if (pageIndex > 2 && pageIndex < table.getPageCount() - 2) {
                pageNum = pageIndex - 2 + i;
              } else if (pageIndex >= table.getPageCount() - 3) {
                pageNum = table.getPageCount() - 5 + i;
              }

              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${pageNum === table.getState().pagination.pageIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => table.setPageIndex(pageNum)}
                >
                  {pageNum + 1}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FaChevronLeft className="text-gray-600" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AbsencesTable;