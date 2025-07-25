import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";
import employeeRouter from "./modules/employee/employee.route.js";
import salarieRouter from "./modules/salarie/salary.route.js";
import leaveRouter from "./modules/leave/leave.route.js";
import absenceRouter from "./modules/absence/absences.route.js";
import reportRouter from "./modules/report/report.route.js";
import departmentRouter from "./modules/department/department.route.js";
import shiftRouter from "./modules/shift/shift.route.js";
import dashboardRouter from "./modules/dashboard/dashboard.route.js";
import attendanceRouter from "./modules/attendance/attendance.route.js";
import notificationsRouter from "./modules/notification/notification.route.js";
import advanceRequestRouter from "./modules/advanceRequest/advanceRequest.route.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app = express();
dotenv.config();

connectDb();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/salaries", salarieRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/absences", absenceRouter);
app.use("/api/reports", reportRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/advance-requests", advanceRequestRouter);

app.get("/*", (req, res) => {
  res.json("hello world");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
