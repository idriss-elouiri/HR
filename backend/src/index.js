import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";
import employeeRouter from "./modules/employee/employee.route.js";
import salarieRouter from "./modules/salarie/salary.route.js";
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
app.use("/api/salaries", salarieRouter);

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