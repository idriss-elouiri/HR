import { useState, useMemo } from 'react';
import {
  Select, SelectItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Pagination, Card, CardBody
} from "@nextui-org/react";

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

const MonthlyReport = ({ data, apiUrl, currentYear, fetchData }) => {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(currentYear.toString());
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const years = useMemo(() => {
    const options = [];
    for (let y = 2020; y <= currentYear + 1; y++) {
      options.push(y.toString());
    }
    return options;
  }, [currentYear]);

  const paginatedData = data?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <Select
          label="الشهر"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          classNames={{
            trigger: "bg-white border border-indigo-200 shadow-sm",
            popoverContent: "bg-gradient-to-b from-indigo-50 to-white"
          }}
        >
          {months.map(m => (
            <SelectItem 
              key={m.value} 
              value={m.value}
              className="hover:bg-indigo-50"
            >
              {m.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="السنة"
          value={year}
          onChange={(e) => setYear(e.target.value)}
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
          onClick={() => fetchData(
            `${apiUrl}/api/reports/monthly?month=${month}&year=${year}`,
            'monthly'
          )}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all h-full"
        >
          تطبيق الفلتر
        </Button>
      </div>

      {data?.length > 0 ? (
        <Card className="rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
          <CardBody className="p-0">
            <Table
              aria-label="التقرير الشهري"
              classNames={{
                wrapper: "shadow-none rounded-xl",
                th: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center",
                td: "text-center border-b border-indigo-100",
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
                <TableColumn className="text-center">اسم الموظف</TableColumn>
                <TableColumn className="text-center">القسم</TableColumn>
                <TableColumn className="text-center">الإجازات</TableColumn>
                <TableColumn className="text-center">الغياب</TableColumn>
                <TableColumn className="text-center">ساعات الغياب</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map(item => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.fullName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell className={item.totalLeaves > 0 ? "text-red-500 font-medium" : ""}>
                      {item.totalLeaves || 0}
                    </TableCell>
                    <TableCell className={item.totalAbsences > 0 ? "text-amber-600 font-medium" : ""}>
                      {item.totalAbsences || 0}
                    </TableCell>
                    <TableCell className={item.totalHours > 0 ? "text-purple-600 font-medium" : ""}>
                      {item.totalHours || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        <Card className="text-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <p className="text-indigo-700 mb-6">لا توجد بيانات متاحة للشهر المحدد</p>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
            onClick={() => fetchData(
              `${apiUrl}/api/reports/monthly?month=${month}&year=${year}`,
              'monthly'
            )}
          >
            تحديث البيانات
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MonthlyReport;