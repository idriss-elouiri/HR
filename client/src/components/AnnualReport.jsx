import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Select, SelectItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Pagination, Card, CardBody, Chip
} from "@nextui-org/react";
import { FaFileExcel, FaFilePdf, FaSearch, FaChevronDown, FaChevronUp, FaInfoCircle, FaUser, FaBuilding, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AnnualReport = ({ fetchData, apiUrl, currentYear }) => {
  const [year, setYear] = useState(currentYear.toString());
  const [reportData, setReportData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // مراقب للتغيرات
  const lastFetchRef = useRef('');

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
    return year !== lastFetchRef.current;
  };

  useEffect(() => {
    if (year && shouldFetch()) {
      fetchReport();
    }
  }, [year]);

  const fetchReport = async () => {
    // تحديث المرجع لمنع الطلبات المتكررة
    lastFetchRef.current = year;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchData(`${apiUrl}/api/reports/annual/${year}`);

      if (data?.success) {
        const formattedData = data.data.map(emp => ({
          ...emp,
          totalLeaves: emp.totalLeaves || 0,
          totalAbsences: emp.totalAbsences || 0,
          totalHours: emp.totalHours || 0,
          leaves: emp.leaves || [],
          absences: emp.absences || []
        }));
        setReportData(formattedData);
      } else {
        setError(data?.message || 'فشل في جلب البيانات من الخادم');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('حدث خطأ أثناء جلب البيانات');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const handleExport = (format) => {
    alert(`سيتم تصدير التقرير السنوي كـ ${format} قريباً`);
  };

  const paginatedData = reportData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // إحصائيات التقرير
  const { totalEmployees, totalLeaves, totalHours, totalAbsences } = useMemo(() => {
    return {
      totalEmployees: reportData.length,
      totalLeaves: reportData.reduce((sum, item) => sum + (item.totalLeaves || 0), 0),
      totalHours: reportData.reduce((sum, item) => sum + (item.totalHours || 0), 0),
      totalAbsences: reportData.reduce((sum, item) => sum + (item.totalAbsences || 0), 0)
    };
  }, [reportData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <div className="flex gap-3 items-center w-full md:w-auto">
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
              <FaUser className="text-xl" />
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
              <FaCalendarAlt className="text-xl" />
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
            <span className="mt-4 text-lg text-gray-600 font-medium">جاري تحميل التقرير السنوي...</span>
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
              aria-label="التقرير السنوي"
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
                <TableColumn className="w-20">تفاصيل</TableColumn>
                <TableColumn>رقم الموظف</TableColumn>
                <TableColumn>اسم الموظف</TableColumn>
                <TableColumn>القسم</TableColumn>
                <TableColumn>إجمالي الإجازات</TableColumn>
                <TableColumn>إجمالي الغياب</TableColumn>
                <TableColumn>إجمالي الساعات</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((employee) => (
                  <>
                    <TableRow key={employee._id || employee.employeeId} className={expandedRows[employee._id] ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => toggleRow(employee._id)}
                          className="bg-gradient-to-r from-indigo-100 to-purple-100"
                        >
                          {expandedRows[employee._id] ? <FaChevronUp className="text-indigo-600" /> : <FaChevronDown className="text-indigo-600" />}
                        </Button>
                      </TableCell>
                      <TableCell>{employee.employeeId || '--'}</TableCell>
                      <TableCell className="font-medium">{employee.fullName || '--'}</TableCell>
                      <TableCell>
                        <Chip
                          variant="flat"
                          color="secondary"
                          startContent={<FaBuilding className="text-xs mr-1" />}
                        >
                          {employee.department || '--'}
                        </Chip>
                      </TableCell>
                      <TableCell className="font-bold text-center text-blue-700">{employee.totalLeaves || 0}</TableCell>
                      <TableCell className="font-bold text-center text-red-700">{employee.totalAbsences || 0}</TableCell>
                      <TableCell className="font-bold text-center text-amber-700">{employee.totalHours || 0}</TableCell>
                    </TableRow>

                    {expandedRows[employee._id] && (
                      <TableRow className="bg-blue-50">
                        <TableCell colSpan={7} className="p-0">
                          <AnimatePresence>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-white rounded-xl shadow-sm border border-blue-100">
                                  <CardBody className="p-4">
                                    <div className="flex items-center mb-3 pb-2 border-b border-blue-100">
                                      <FaCalendarAlt className="text-blue-500 mr-2" />
                                      <h4 className="font-bold text-blue-800">تفاصيل الإجازات</h4>
                                    </div>
                                    <ul className="space-y-3">
                                      {employee.leaves && employee.leaves.length > 0 ? (
                                        employee.leaves.map((leave, index) => (
                                          <li key={index} className="flex justify-between items-center py-1">
                                            <span className="font-medium text-gray-700">{leave.type}:</span>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                              {leave.days} يوم
                                            </span>
                                          </li>
                                        ))
                                      ) : (
                                        <li className="text-gray-500 text-center py-3">لا توجد بيانات للإجازات</li>
                                      )}
                                    </ul>
                                  </CardBody>
                                </Card>

                                <Card className="bg-white rounded-xl shadow-sm border border-amber-100">
                                  <CardBody className="p-4">
                                    <div className="flex items-center mb-3 pb-2 border-b border-amber-100">
                                      <FaClock className="text-amber-500 mr-2" />
                                      <h4 className="font-bold text-amber-800">تفاصيل الغياب</h4>
                                    </div>
                                    <ul className="space-y-3">
                                      {employee.absences && employee.absences.length > 0 ? (
                                        employee.absences.map((absence, index) => (
                                          <li key={index} className="flex justify-between items-center py-1">
                                            <span className="font-medium text-gray-700">{absence.type}:</span>
                                            <div className="flex gap-2">
                                              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                                                {absence.count} مرة
                                              </span>
                                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                                                {absence.hours} ساعة
                                              </span>
                                            </div>
                                          </li>
                                        ))
                                      ) : (
                                        <li className="text-gray-500 text-center py-3">لا توجد بيانات للغياب</li>
                                      )}
                                    </ul>
                                  </CardBody>
                                </Card>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
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
              لا توجد بيانات متاحة للسنة المحددة
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              لم يتم العثور على أي بيانات للإجازات أو الغياب المعتمدة للسنة المحددة.
              الرجاء التأكد من اختيار السنة الصحيحة.
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

export default AnnualReport;