import z from "zod";

export type TBranchEmployee = {
  // ********************* البيانات العامة ***************************
  uuid: string;
  full_name: string;
  branch_name: string;
  Job: string;
  tel: string;
  email: string;
  employment_history: string;
  blocked: boolean;

  // ********************* الحقول الاختيارية ***************************
  phone?: string;
  mobile?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  status?: "active" | "inactive" | string;

  // ********************* البيانات الأساسية ***************************
  branch_id?: string;
  department_id?: string;
  country_id?: string;
  city_id?: string;
  national_id?: string;
  branch_job_id?: string;

  // ********************* بيانات تسجيل الدخول ***************************
  role_id?: string;
  username?: string;

  // ********************* بيانات التوظيف ***************************
  salary?: string;
  hire_date?: string;
  commission?: string;
  contract_end_date?: string;
  fingerprint_device_number?: string;
  work_from?: string;
  work_to?: string;
};

export type TListItem = {
  id: string;
  name: string
}

export const employeeSchema = z.object({
  // ********************* البيانات الأساسية ***************************
  full_name: z.string().min(2, { message: "الاسم الكامل مطلوب" }),
  branch_id: z.string().min(1, { message: "رقم الفرع مطلوب" }),
  phone: z.string().min(8, { message: "رقم الهاتف مطلوب" }),
  department_id: z.string().min(1, { message: "رقم القسم مطلوب" }),
  country_id: z.string().min(1, { message: "الدولة مطلوبة" }),
  city_id: z.string().min(1, { message: "المدينة مطلوبة" }),
  national_id: z.string().min(2, { message: "الرقم القومي مطلوب" }),
  branch_job_id: z.string().min(1, { message: "الوظيفة مطلوبة" }),

  // ********************* بيانات تسجيل الدخول ***************************
  role_id: z.string().min(1, { message: "الدور مطلوب" }),
  username: z.string().min(2, { message: "اسم المستخدم مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),

  // ********************* بيانات التوظيف ***************************
  salary: z.string().min(1, { message: "الراتب مطلوب" }),
  hire_date: z.string().min(1, { message: "تاريخ التعيين مطلوب" }),
  commission: z.string().optional(),
  contract_end_date: z.string().min(1, { message: "تاريخ انتهاء العقد مطلوب" }),
  fingerprint_device_number: z.string().optional(),
  work_from: z.string().min(1, { message: "وقت بدء العمل مطلوب" }),
  work_to: z.string().min(1, { message: "وقت نهاية العمل مطلوب" }),
});
