import { z } from "zod";

export const employeeSchema = z.object({
  employeeId: z.string({ required_error: "رقم الموظف مطلوب" }).min(1),
  fullName: z.string({ required_error: "الاسم الكامل مطلوب" }).min(3),
  gender: z.enum(["ذكر", "أنثى"], { required_error: "الجنس مطلوب" }),
  maritalStatus: z.enum(["أعزب", "متزوج", "مطلق", "أرمل"], { required_error: "الحالة الاجتماعية مطلوبة" }),
  department: z.string({ required_error: "القسم مطلوب" }).min(2),
  jobTitle: z.string({ required_error: "المسمى الوظيفي مطلوب" }).min(2),
  contractType: z.enum(["دوام كامل", "دوام جزئي", "مؤقت"], { required_error: "نوع العقد مطلوب" }),
  socialSecurityNumber: z.string({ required_error: "رقم الضمان الاجتماعي مطلوب" }).regex(/^\d+$/, "يجب أن يكون رقماً"),
  nationalId: z.string({ required_error: "رقم الهوية مطلوب" }).regex(/^\d+$/, "يجب أن يكون رقماً"),
  phone: z.string({ required_error: "رقم الهاتف مطلوب" }).regex(/^\+?[0-9]+$/, "رقم هاتف غير صالح"),
  email: z.string({ required_error: "البريد الإلكتروني مطلوب" }).email("بريد إلكتروني غير صالح"),
  address: z.string({ required_error: "العنوان مطلوب" }).min(5),
  hireDate: z.string({ required_error: "تاريخ التوظيف مطلوب" }).regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح"),
  employmentStatus: z.enum(["نشط", "موقوف", "مفصول"]).optional()
});