import { useState, useMemo } from 'react';
import {
  Select, SelectItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Pagination, Card, CardBody
} from "@nextui-org/react";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AnnualReport = ({ data, apiUrl, currentYear, fetchData }) => {
  const [year, setYear] = useState(currentYear.toString());
  const [expandedRows, setExpandedRows] = useState({});
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const years = useMemo(() => {
    const options = [];
    for (let y = 2020; y <= currentYear + 1; y++) {
      options.push(y.toString());
    }
    return options;
  }, [currentYear]);

  const toggleRow = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const paginatedData = data?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <Select
          label="السنة"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="max-w-xs"
          classNames={{
            trigger: "bg-white border border-indigo-200 shadow-sm",
            popoverContent: "bg-gradient-to-b from-indigo-50 to-white"
          }}
        >
          {years.map(y => (
            <SelectItem 
              key={y} 
              value={y}
              className="hover:bg-indigo-50"
            >
              {y}
            </SelectItem>
          ))}
        </Select>

        <Button
          onClick={() => fetchData(`${apiUrl}/api/reports/annual/${year}`, 'annual')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all w-full md:w-auto"
        >
          تطبيق الفلتر
        </Button>
      </div>

      {data?.length > 0 ? (
        <Card className="rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
          <CardBody className="p-0">
            <Table
              aria-label="التقرير السنوي"
              classNames={{
                wrapper: "shadow-none rounded-xl",
                th: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
                td: "border-b border-indigo-100",
                tr: "even:bg-indigo-50 hover:bg-indigo-100 transition-colors"
              }}
              bottomContent={
                <div className="flex justify-center p-3 bg-indigo-50">
                  <Pagination
                    page={page}
                    total={Math.ceil(data.length / rowsPerPage)}
                    onChange={setPage}
                    color="secondary"
                    classNames={{
                      item: "bg-white text-indigo-700",
                      cursor: "bg-gradient-to-r from-indigo-600 to-purple-600"
                    }}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn className="w-16">تفاصيل</TableColumn>
                <TableColumn>اسم الموظف</TableColumn>
                <TableColumn>القسم</TableColumn>
                <TableColumn>إجمالي الإجازات</TableColumn>
                <TableColumn>إجمالي الغياب</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map(employee => (
                  <>
                    <TableRow key={employee._id} className="group">
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                          onClick={() => toggleRow(employee._id)}
                        >
                          {expandedRows[employee._id] ? <FaChevronUp /> : <FaChevronDown />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{employee.fullName}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="text-indigo-700 font-medium">{employee.totalLeaves || 0}</TableCell>
                      <TableCell className="text-purple-700 font-medium">{employee.totalAbsences || 0}</TableCell>
                    </TableRow>

                    {expandedRows[employee._id] && (
                      <TableRow className="bg-indigo-50">
                        <TableCell colSpan={5} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-white p-4 border border-indigo-200 rounded-xl shadow-sm">
                              <h4 className="font-bold mb-3 text-indigo-700 flex items-center gap-2">
                                <span>تفاصيل الإجازات</span>
                              </h4>
                              <ul className="space-y-2">
                                {employee.leaves?.map((leave, idx) => (
                                  <li key={idx} className="flex justify-between bg-indigo-50 p-2 rounded-lg">
                                    <span className="text-indigo-600">{leave.type}:</span>
                                    <span className="font-medium">{leave.days} يوم</span>
                                  </li>
                                ))}
                              </ul>
                            </Card>

                            <Card className="bg-white p-4 border border-indigo-200 rounded-xl shadow-sm">
                              <h4 className="font-bold mb-3 text-purple-700 flex items-center gap-2">
                                <span>تفاصيل الغياب</span>
                              </h4>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="flex justify-between">
                                  <span className="text-purple-600">إجمالي الساعات:</span>
                                  <span className="font-medium">{employee.totalHours || 0} ساعة</span>
                                </p>
                              </div>
                            </Card>
                          </div>
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
        <Card className="text-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <p className="text-indigo-700 mb-6">لا توجد بيانات متاحة للسنة المحددة</p>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
            onClick={() => fetchData(`${apiUrl}/api/reports/annual/${year}`, 'annual')}
          >
            تحديث البيانات
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnnualReport;