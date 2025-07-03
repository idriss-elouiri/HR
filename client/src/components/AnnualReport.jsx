import { useState, useEffect } from 'react';
import {
  Select, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Pagination
} from "@nextui-org/react";
import { FaFileExcel, FaFilePdf, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AnnualReport = ({ fetchData, apiUrl, currentYear }) => {
  const [year, setYear] = useState(currentYear.toString());
  const [reportData, setReportData] = useState([]);
  const [years, setYears] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const startYear = 2020;
    const yearOptions = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      yearOptions.push(y.toString());
    }
    setYears(yearOptions);
    fetchReport();
  }, [currentYear]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchData(`${apiUrl}/api/reports/annual/${year}`);

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

  const toggleRow = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const handleExport = (format) => {
    toast.info(`سيتم تصدير التقرير السنوي كـ ${format} قريباً`);
  };

  const paginatedData = reportData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex gap-4 items-center w-full md:w-auto">
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
          <span className="mr-2">جاري تحميل التقرير السنوي...</span>
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
          <Table
            aria-label="التقرير السنوي"
            className="min-w-full"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={Math.ceil(reportData.length / rowsPerPage)}
                  onChange={(newPage) => setPage(newPage)}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>تفاصيل</TableColumn>
              <TableColumn>رقم الموظف</TableColumn>
              <TableColumn>اسم الموظف</TableColumn>
              <TableColumn>القسم</TableColumn>
              <TableColumn>إجمالي الإجازات</TableColumn>
              <TableColumn>إجمالي الغياب</TableColumn>
              <TableColumn>إجمالي الساعات</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedData.map((employee) => (
                <React.Fragment key={employee._id || employee.employeeId}>
                  <TableRow className={expandedRows[employee._id] ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => toggleRow(employee._id)}
                      >
                        {expandedRows[employee._id] ? <FaChevronUp /> : <FaChevronDown />}
                      </Button>
                    </TableCell>
                    <TableCell>{employee.employeeId || '--'}</TableCell>
                    <TableCell className="font-medium">{employee.fullName || '--'}</TableCell>
                    <TableCell>{employee.department || '--'}</TableCell>
                    <TableCell className="text-center">{employee.totalLeaves || 0}</TableCell>
                    <TableCell className="text-center">{employee.totalAbsences || 0}</TableCell>
                    <TableCell className="text-center">{employee.totalHours || 0}</TableCell>
                  </TableRow>

                  {expandedRows[employee._id] && (
                    <TableRow className="bg-blue-100">
                      <TableCell colSpan={7}>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-bold text-blue-800 mb-3 pb-2 border-b">تفاصيل الإجازات</h4>
                            <ul className="space-y-2">
                              {employee.leaves && employee.leaves.length > 0 ? (
                                employee.leaves.map((leave, index) => (
                                  <li key={index} className="flex justify-between">
                                    <span className="font-medium">{leave.type}:</span>
                                    <span>{leave.days} يوم</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">لا توجد بيانات للإجازات</li>
                              )}
                            </ul>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-bold text-blue-800 mb-3 pb-2 border-b">تفاصيل الغياب</h4>
                            <ul className="space-y-2">
                              {employee.absences && employee.absences.length > 0 ? (
                                employee.absences.map((absence, index) => (
                                  <li key={index} className="flex justify-between">
                                    <span className="font-medium">{absence.type}:</span>
                                    <span>{absence.count} مرة ({absence.hours} ساعة)</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">لا توجد بيانات للغياب</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
            <div className="text-center">
              <h4 className="font-bold text-blue-800">إجمالي الموظفين</h4>
              <p className="text-2xl font-bold">{reportData.length}</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-blue-800">إجمالي أيام الإجازات</h4>
              <p className="text-2xl font-bold">
                {reportData.reduce((sum, item) => sum + (item.totalLeaves || 0), 0)}
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-blue-800">إجمالي ساعات الغياب</h4>
              <p className="text-2xl font-bold">
                {reportData.reduce((sum, item) => sum + (item.totalHours || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
            <FaInfoCircle className="text-blue-500 text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد بيانات متاحة للسنة المحددة
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            لم يتم العثور على أي بيانات للإجازات أو الغياب المعتمدة للسنة المحددة.
            الرجاء التأكد من اختيار السنة الصحيحة.
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

export default AnnualReport; 