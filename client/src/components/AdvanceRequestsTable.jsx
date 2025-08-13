'use client';
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaSync,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const AdvanceRequestsTable = ({
  data = [],
  onDelete,
  onApprove,
  onReject,
  loading = false,
}) => {
  const columns = useMemo(
    () => [
      {
        header: "الموظف",
        accessorFn: (row) => row.employee?.fullName || "---",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.employee?.fullName || "---"}
            </span>
            <span className="text-xs text-gray-500">
              {row.original.employee?.employeeId || "---"}
            </span>
          </div>
        ),
      },
      {
        header: "المبلغ",
        accessorKey: "amount",
        cell: ({ getValue }) => (
          <span className="font-bold text-blue-700">
            {Number(getValue()).toLocaleString("ar-IR", {
              style: "currency",
              currency: "IQD",
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        header: "السبب",
        accessorKey: "reason",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      },
      {
        header: "طريقة السداد",
        accessorKey: "repaymentMethod",
      },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const statusClasses = {
            "معلقة": "bg-yellow-100 text-yellow-800",
            "موافق عليها": "bg-green-100 text-green-800",
            "مرفوضة": "bg-red-100 text-red-800",
            "مسددة": "bg-blue-100 text-blue-800",
          };

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusClasses[getValue()] || "bg-gray-100 text-gray-800"
              }`}
            >
              {getValue()}
            </span>
          );
        },
      },
      {
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            {row.original.status === "معلقة" && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onApprove(row.original._id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="موافقة"
                  aria-label="موافقة"
                >
                  <FaCheck />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReject(row.original._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="رفض"
                  aria-label="رفض"
                >
                  <FaTimes />
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(row.original._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="حذف"
              aria-label="حذف"
            >
              <FaTrash />
            </motion.button>
          </div>
        ),
      },
    ],
    [onDelete, onApprove, onReject]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200"
    >
      <div className="p-4">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              placeholder="ابحث عن طلب سلفة..."
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              disabled={loading}
            />
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
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-gray-600">
                      جاري تحميل طلبات السلفة...
                    </p>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <FaFileAlt className="mx-auto text-3xl text-gray-300 mb-3" />
                    <p className="text-gray-600">لا توجد طلبات سلفة</p>
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">عرض</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {[5, 10, 20].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">صفوف</span>
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
                الصفحة {table.getState().pagination.pageIndex + 1} من{" "}
                {table.getPageCount()}
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
                {data.length} طلب
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvanceRequestsTable;