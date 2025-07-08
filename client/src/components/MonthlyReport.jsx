import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Select, SelectItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Pagination, Card, CardBody
} from "@nextui-org/react";
import { FaFileExcel, FaFilePdf, FaSearch, FaInfoCircle, FaCalendarAlt, FaUser, FaLeaf, FaClock, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // مراقب للتغيرات
  const lastFetchRef = useRef({ month: '', year: '' });

  const years = useMemo(() => {
    const startYear = 2020;
    const options = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      options.push(y.toString());
    }
    return options;
  }, [currentYear]);

  // منع الطلبات المتكررة لنفس البيانات
  const shouldFetch = () => {
    return month !== lastFetchRef.current.month || year !== lastFetchRef.current.year;
  };

  useEffect(() => {
    if (month && year && shouldFetch()) {
      fetchReport();
    }
  }, [month, year]);

  const fetchReport = async () => {
    // تحديث المرجع لمنع الطلبات المتكررة
    lastFetchRef.current = { month, year };

    setIsLoading(true);
    setError(null);
    setReportData([]);

    try {
      const data = await fetchData(`${apiUrl}/api/reports/monthly?month=${month}&year=${year}`);

      if (data?.success) {
        const formattedData = data.data.map(item => ({
          ...item,
          totalLeaves: item.totalLeaves || 0,
          totalAbsences: item.totalAbsences || 0,
          totalHours: item.totalHours || 0
        }));
        setReportData(formattedData);
      } else {
        setError(data?.message || 'فشل في جلب البيانات من الخادم');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // إحصائيات التقرير
  const { totalEmployees, totalLeaves, totalHours, totalAbsences } = useMemo(() => {
    return {
      totalEmployees: reportData.length,
      totalLeaves: reportData.reduce((sum, item) => sum + (item.totalLeaves || 0), 0),
      totalHours: reportData.reduce((sum, item) => sum + (item.totalHours || 0), 0),
      totalAbsences: reportData.reduce((sum, item) => sum + (item.totalAbsences || 0), 0)
    };
  }, [reportData]);

  const handleExport = (format) => {
    alert(`سيتم تصدير التقرير الشهري كـ ${format} قريباً`);
  };

  const paginatedData = reportData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Select
            label="الشهر"
            labelPlacement="outside"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-xs"
            isDisabled={isLoading}
            classNames={{
              trigger: "bg-white border border-indigo-200 shadow-sm",
              label: "font-medium text-indigo-700"
            }}
            startContent={<FaCalendarAlt className="text-indigo-500" />}
          >
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="السنة"
            labelPlacement="outside"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="max-w-xs"
            isDisabled={isLoading}
            classNames={{
              trigger: "bg-white border border-indigo-200 shadow-sm",
              label: "font-medium text-indigo-700"
            }}
            startContent={<FaCalendarAlt className="text-indigo-500" />}
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
            className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
            isDisabled={isLoading}
            endContent={<FaSearch className="ml-2" />}
          >
            بحث
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
            startContent={<FaFileExcel />}
            onClick={() => handleExport('Excel')}
            isDisabled={reportData.length === 0 || isLoading}
          >
            تصدير Excel
          </Button>
          <Button
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
            startContent={<FaFilePdf />}
            onClick={() => handleExport('PDF')}
            isDisabled={reportData.length === 0 || isLoading}
          >
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg">
          <CardBody className="flex flex-row items-center p-4">
            <div className="bg-white/20 p-3 rounded-full mr-3">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-sm opacity-80">الموظفين</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
          <CardBody className="flex flex-row items-center p-4">
            <div className="bg-white/20 p-3 rounded-full mr-3">
              <FaLeaf className="text-xl" />
            </div>
            <div>
              <p className="text-sm opacity-80">إجمالي الإجازات</p>
              <p className="text-2xl font-bold">{totalLeaves}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
          <CardBody className="flex flex-row items-center p-4">
            <div className="bg-white/20 p-3 rounded-full mr-3">
              <FaInfoCircle className="text-xl" />
            </div>
            <div>
              <p className="text-sm opacity-80">إجمالي الغياب</p>
              <p className="text-2xl font-bold">{totalAbsences}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
          <CardBody className="flex flex-row items-center p-4">
            <div className="bg-white/20 p-3 rounded-full mr-3">
              <FaClock className="text-xl" />
            </div>
            <div>
              <p className="text-sm opacity-80">إجمالي الساعات</p>
              <p className="text-2xl font-bold">{totalHours}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {isLoading ? (
        <Card className="rounded-2xl shadow-lg">
          <CardBody className="flex flex-col items-center justify-center py-16">
            <Spinner
              size="lg"
              classNames={{
                circle1: "border-b-indigo-600",
                circle2: "border-b-indigo-600",
              }}
            />
            <span className="mt-4 text-lg text-gray-600 font-medium">جاري تحميل التقرير الشهري...</span>
          </CardBody>
        </Card>
      ) : error ? (
        <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
          <CardBody className="text-center py-12">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <FaInfoCircle className="text-red-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">حدث خطأ</h3>
            <p className="mb-6 max-w-md mx-auto text-red-700">{error}</p>
            <Button
              color="primary"
              onClick={fetchReport}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              المحاولة مرة أخرى
            </Button>
          </CardBody>
        </Card>
      ) : reportData.length > 0 ? (
        <Card className="rounded-2xl shadow-xl overflow-hidden">
          <CardBody className="p-0">
            <Table
              aria-label="التقرير الشهري"
              className="min-w-full"
              classNames={{
                wrapper: "rounded-none",
                th: "bg-gradient-to-r from-indigo-700 to-purple-700 text-white text-center",
                td: "text-center",
                tr: "hover:bg-indigo-50 transition-colors"
              }}
              bottomContent={
                <div className="flex w-full justify-center p-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={Math.ceil(reportData.length / rowsPerPage)}
                    onChange={(newPage) => setPage(newPage)}
                    classNames={{
                      item: "bg-white",
                      cursor: "bg-gradient-to-r from-indigo-600 to-purple-600"
                    }}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>رقم الموظف</TableColumn>
                <TableColumn>اسم الموظف</TableColumn>
                <TableColumn>القسم</TableColumn>
                <TableColumn>إجازات (يوم)</TableColumn>
                <TableColumn>غياب (مرة)</TableColumn>
                <TableColumn>ساعات غياب</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.employeeId}</TableCell>
                    <TableCell>{item.fullName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.totalLeaves}</TableCell>
                    <TableCell>{item.totalAbsences}</TableCell>
                    <TableCell>{item.totalHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
          <CardBody className="text-center py-16">
            <div className="inline-block p-5 bg-indigo-100 rounded-full mb-5">
              <FaInfoCircle className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-800 mb-3">
              لا توجد بيانات متاحة للشهر والسنة المحددين
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              لم يتم العثور على أي بيانات للإجازات أو الغياب المعتمدة للشهر والسنة المحددين.
              الرجاء التأكد من اختيار الشهر والسنة الصحيحين.
            </p>
            <Button
              color="primary"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              onClick={fetchReport}
              startContent={<FaSearch />}
            >
              المحاولة مرة أخرى
            </Button>
          </CardBody>
        </Card>
      )}
    </motion.div>
  );
};

export default MonthlyReport;