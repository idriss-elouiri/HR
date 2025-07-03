import { useState, useEffect } from 'react';
import {
  Select, SelectItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Pagination
} from "@nextui-org/react";
import { FaFileExcel, FaFilePdf, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const months = [
  { label: "يناير", value: "1" },
  { label: "فبراير", value: "2" },
  { label: "مارس", value: "3" },
  { label: "أبريل", value: "4" },
  { label: "مايو", value: "5" },
  { label: "يونيو", value: "6" },
  { label: "يوليو", value: "7" },
  { label: "أغسطس", value: "8" },
  { label: "سبتمبر", value: "9" },
  { label: "أكتوبر", value: "10" },
  { label: "نوفمبر", value: "11" },
  { label: "ديسمبر", value: "12" },
];

const MonthlyReport = ({ fetchData, apiUrl, currentYear }) => {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(currentYear.toString());
  const [reportData, setReportData] = useState([]);
  const [years, setYears] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startYear = 2020;
    const yearOptions = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      yearOptions.push(y.toString());
    }
    setYears(yearOptions);
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    setReportData([]);

    try {
      const data = await fetchData(`${apiUrl}/api/reports/monthly?month=${month}&year=${year}`);

      if (data && data.success) {
        setReportData(data.data);
      } else {
        setError('فشل في جلب البيانات من الخادم');
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format) => {
    toast.info(`سيتم تصدير التقرير الشهري كـ ${format} قريباً`);
  };

  const paginatedData = reportData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  { console.log('Report Data:', reportData) }
  { console.log('Paginated Data:', paginatedData) }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
          <Select
            label="الشهر"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-xs"
            isDisabled={isLoading}
          >
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="السنة"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="max-w-xs"
            isDisabled={isLoading}
          >
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            onClick={fetchReport}
            className="h-14"
            isDisabled={isLoading}
          >
            <FaSearch className="ml-2" /> بحث
          </Button>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            color="success"
            startContent={<FaFileExcel />}
            onClick={() => handleExport('Excel')}
            isDisabled={reportData.length === 0 || isLoading}
          >
            تصدير Excel
          </Button>
          <Button
            color="danger"
            startContent={<FaFilePdf />}
            onClick={() => handleExport('PDF')}
            isDisabled={reportData.length === 0 || isLoading}
          >
            تصدير PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" color="primary" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">
          <FaInfoCircle className="text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">حدث خطأ</h3>
          <p className="mb-4">{error}</p>
          <Button color="primary" onClick={fetchReport}>
            المحاولة مرة أخرى
          </Button>
        </div>
      ) : reportData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الموظف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الموظف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجازات (يوم)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">غياب (مرة)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعات غياب</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{item.employeeId || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{item.fullName || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.department || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{item.totalLeaves || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{item.totalAbsences || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{item.totalHours || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>


          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-800 font-bold">إجمالي الموظفين</div>
              <div className="text-2xl font-bold">{reportData.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-green-800 font-bold">إجمالي أيام الإجازات</div>
              <div className="text-2xl font-bold">
                {reportData.reduce((sum, item) => sum + (item.totalLeaves || 0), 0)}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-red-800 font-bold">إجمالي ساعات الغياب</div>
              <div className="text-2xl font-bold">
                {reportData.reduce((sum, item) => sum + (item.totalHours || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
            <FaInfoCircle className="text-blue-500 text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد بيانات متاحة للشهر والسنة المحددين
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            لم يتم العثور على أي بيانات للإجازات أو الغياب المعتمدة للشهر والسنة المحددين.
            الرجاء التأكد من اختيار الشهر والسنة الصحيحين.
          </p>
          <Button
            color="primary"
            className="mt-4"
            onClick={fetchReport}
          >
            <FaSearch className="ml-2" /> المحاولة مرة أخرى
          </Button>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport