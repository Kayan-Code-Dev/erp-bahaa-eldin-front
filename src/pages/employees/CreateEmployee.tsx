import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  User, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Building2, 
  Phone, 
  MapPin, 
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format, parse } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesSelect } from "@/components/custom/JobTitlesSelect";
import { RolesSelect } from "@/components/custom/roles-select";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { FactoriesSelect } from "@/components/custom/FactoriesSelect";
import { WorkshopsSelect } from "@/components/custom/WorkshopsSelect";
import { BranchesSelect as MultiBranchesSelect } from "@/components/custom/MultiBranchesSelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { useCreateEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";
import { TCreateEmployeeRequest } from "@/api/v2/employees/employees.types";
import { EMPLOYMENT_TYPES } from "@/api/v2/employees/employees.types";
import { TEntity } from "@/lib/types/entity.types";

// Schema for the form
const formSchema = z.object({
  // Required fields
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  hire_date: z.string().min(1, { message: "تاريخ التوظيف مطلوب" }),

  // Optional fields
  department_id: z.string().optional(),
  job_title_id: z.string().optional(),
  manager_id: z.string().optional(),
  employment_type: z.enum(EMPLOYMENT_TYPES as unknown as [string, ...string[]]).optional(),
  roles: z.array(z.string()).optional(),
  base_salary: z.string().optional(),
  transport_allowance: z.string().optional(),
  housing_allowance: z.string().optional(),
  other_allowances: z.string().optional(),
  overtime_rate: z.string().optional(),
  commission_rate: z.string().optional(),
  annual_vacation_days: z.string().optional(),
  probation_end_date: z.string().optional(),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  work_hours_per_day: z.string().optional(),
  late_threshold_minutes: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_iban: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  notes: z.string().optional(),
  primary_branch_id: z.string().optional(),

  // Entity assignments
  factory_ids: z.array(z.string()).optional(),
  workshop_ids: z.array(z.string()).optional(),
  branch_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function CreateEmployee() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: createEmployee, isPending } = useMutation(
    useCreateEmployeeQueryOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      hire_date: "",
      department_id: "",
      job_title_id: "",
      manager_id: "",
      employment_type: undefined,
      roles: [],
      base_salary: "",
      transport_allowance: "",
      housing_allowance: "",
      other_allowances: "",
      overtime_rate: "",
      commission_rate: "",
      annual_vacation_days: "",
      probation_end_date: "",
      work_start_time: "",
      work_end_time: "",
      work_hours_per_day: "",
      late_threshold_minutes: "",
      bank_name: "",
      bank_account_number: "",
      bank_iban: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      notes: "",
      primary_branch_id: "",
      factory_ids: [],
      workshop_ids: [],
      branch_ids: [],
    },
  });

  const onSubmit = (values: FormValues) => {
    // Build entity_assignments array
    const entityAssignments: TCreateEmployeeRequest["entity_assignments"] = [];

    // Add factories
    if (values.factory_ids && values.factory_ids.length > 0) {
      values.factory_ids.forEach((factoryId, index) => {
        entityAssignments.push({
          entity_type: "factory" as TEntity,
          entity_id: Number(factoryId),
          is_primary: index === 0,
        });
      });
    }

    // Add workshops
    if (values.workshop_ids && values.workshop_ids.length > 0) {
      values.workshop_ids.forEach((workshopId, index) => {
        entityAssignments.push({
          entity_type: "workshop" as TEntity,
          entity_id: Number(workshopId),
          is_primary: index === 0,
        });
      });
    }

    // Add branches
    if (values.branch_ids && values.branch_ids.length > 0) {
      values.branch_ids.forEach((branchId, index) => {
        entityAssignments.push({
          entity_type: "branch" as TEntity,
          entity_id: Number(branchId),
          is_primary: index === 0,
        });
      });
    }

    const requestData: TCreateEmployeeRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      hire_date: values.hire_date,
      department_id: values.department_id ? Number(values.department_id) : undefined,
      job_title_id: values.job_title_id ? Number(values.job_title_id) : undefined,
      manager_id: values.manager_id ? Number(values.manager_id) : undefined,
      employment_type: values.employment_type as TCreateEmployeeRequest["employment_type"],
      roles: values.roles ? values.roles.map(Number) : undefined,
      // branch_ids as in sent JSON: array of numbers for selected branches
      branch_ids: values.branch_ids && values.branch_ids.length > 0
        ? values.branch_ids.map((id) => Number(id))
        : undefined,
      base_salary: values.base_salary ? Number(values.base_salary) : undefined,
      transport_allowance: values.transport_allowance ? Number(values.transport_allowance) : undefined,
      housing_allowance: values.housing_allowance ? Number(values.housing_allowance) : undefined,
      other_allowances: values.other_allowances ? Number(values.other_allowances) : undefined,
      overtime_rate: values.overtime_rate ? Number(values.overtime_rate) : undefined,
      commission_rate: values.commission_rate ? Number(values.commission_rate) : undefined,
      annual_vacation_days: values.annual_vacation_days ? Number(values.annual_vacation_days) : undefined,
      probation_end_date: values.probation_end_date || undefined,
      work_start_time: values.work_start_time || undefined,
      work_end_time: values.work_end_time || undefined,
      work_hours_per_day: values.work_hours_per_day ? Number(values.work_hours_per_day) : undefined,
      late_threshold_minutes: values.late_threshold_minutes ? Number(values.late_threshold_minutes) : undefined,
      bank_name: values.bank_name || undefined,
      bank_account_number: values.bank_account_number || undefined,
      bank_iban: values.bank_iban || undefined,
      emergency_contact_name: values.emergency_contact_name || undefined,
      emergency_contact_phone: values.emergency_contact_phone || undefined,
      emergency_contact_relation: values.emergency_contact_relation || undefined,
      notes: values.notes || undefined,
      primary_branch_id: values.primary_branch_id ? Number(values.primary_branch_id) : undefined,
      entity_assignments: entityAssignments.length > 0 ? entityAssignments : undefined,
    };

    createEmployee(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الموظف بنجاح", {
          description: "تمت إضافة الموظف بنجاح للنظام.",
        });
        form.reset();
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الموظف", {
          description: error.message,
        });
      },
    });
  };

  const employmentTypeLabels: Record<string, string> = {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contract: "عقد",
    intern: "متدرب",
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">إنشاء موظف جديد</h1>
            <p className="text-muted-foreground text-base">املأ البيانات المطلوبة لإضافة موظف جديد للنظام.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Required Fields Section */}
          <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                      البيانات المطلوبة
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm">
                      يرجى ملء جميع الحقول التالية لإتمام عملية الإنشاء
                    </CardDescription>
                  </div>
                </div>
                <span className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  مطلوب
                </span>
              </div>
            </CardHeader>
            <Separator className="bg-primary/20" />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      الاسم <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الموظف" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      البريد الإلكتروني <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@email.com" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      كلمة المرور <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10 h-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={
                            showPassword
                              ? "إخفاء كلمة المرور"
                              : "إظهار كلمة المرور"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      تاريخ التوظيف <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(
                            date
                              ? date.toISOString().split("T")[0]
                              : ""
                          );
                        }}
                        placeholder="اختر تاريخ التوظيف"
                        showLabel={false}
                        disabled={isPending}
                        allowFutureDates={true}
                        allowPastDates={true}
                        buttonClassName="w-full h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Optional Fields Section */}
          <div className="space-y-6">
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-dashed">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1">البيانات الاختيارية</h2>
                  <p className="text-sm text-muted-foreground">يمكنك ملء هذه البيانات لاحقاً أو تركها فارغة</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full font-medium border">
                  اختياري
                </span>
              </div>
            </div>

          {/* Job Information Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold">معلومات الوظيفة</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم</FormLabel>
                    <FormControl>
                      <DepartmentsSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_title_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <JobTitlesSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدير المباشر</FormLabel>
                    <FormControl>
                      <EmployeesSelect
                        params={{ per_page: 10, level: "master_manager" as any }}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                        placeholder="اختر المدير المباشر"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع التوظيف</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع التوظيف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {employmentTypeLabels[type] || type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأدوار</FormLabel>
                    <FormControl>
                      <RolesSelect
                        multi={true}
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفرع الرئيسي</FormLabel>
                    <FormControl>
                      <BranchesSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Salary Information Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg font-semibold">معلومات الراتب</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الأساسي</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transport_allowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بدل المواصلات</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="housing_allowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بدل السكن</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="other_allowances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بدلات أخرى</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overtime_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معدل العمل الإضافي</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معدل العمولة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Work Schedule Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg font-semibold">جدول العمل</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="work_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت بدء العمل</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={
                          field.value
                            ? (() => {
                                try {
                                  // Try parsing as HH:mm:ss first
                                  if (field.value.includes(":")) {
                                    const parts = field.value.split(":");
                                    if (parts.length === 3) {
                                      // Already in HH:mm:ss format
                                      return format(
                                        parse(field.value, "HH:mm:ss", new Date()),
                                        "HH:mm"
                                      );
                                    } else if (parts.length === 2) {
                                      // Already in HH:mm format
                                      return field.value;
                                    }
                                  }
                                  // Try parsing as HH:mm:ss
                                  return format(
                                    parse(field.value, "HH:mm:ss", new Date()),
                                    "HH:mm"
                                  );
                                } catch {
                                  // If parsing fails, try to extract HH:mm
                                  if (field.value.includes(":")) {
                                    return field.value.split(":").slice(0, 2).join(":");
                                  }
                                  return "";
                                }
                              })()
                            : ""
                        }
                        onChange={(e) => {
                          const timeValue = e.target.value; // HH:mm format from input
                          if (timeValue) {
                            try {
                              // Convert HH:mm to HH:mm:ss using date-fns
                              const date = parse(timeValue, "HH:mm", new Date());
                              const formattedTime = format(date, "HH:mm:ss");
                              field.onChange(formattedTime);
                            } catch {
                              // If parsing fails, append :00 to make it HH:mm:ss
                              field.onChange(timeValue + ":00");
                            }
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت انتهاء العمل</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={
                          field.value
                            ? (() => {
                                try {
                                  // Try parsing as HH:mm:ss first
                                  if (field.value.includes(":")) {
                                    const parts = field.value.split(":");
                                    if (parts.length === 3) {
                                      // Already in HH:mm:ss format
                                      return format(
                                        parse(field.value, "HH:mm:ss", new Date()),
                                        "HH:mm"
                                      );
                                    } else if (parts.length === 2) {
                                      // Already in HH:mm format
                                      return field.value;
                                    }
                                  }
                                  // Try parsing as HH:mm:ss
                                  return format(
                                    parse(field.value, "HH:mm:ss", new Date()),
                                    "HH:mm"
                                  );
                                } catch {
                                  // If parsing fails, try to extract HH:mm
                                  if (field.value.includes(":")) {
                                    return field.value.split(":").slice(0, 2).join(":");
                                  }
                                  return "";
                                }
                              })()
                            : ""
                        }
                        onChange={(e) => {
                          const timeValue = e.target.value; // HH:mm format from input
                          if (timeValue) {
                            try {
                              // Convert HH:mm to HH:mm:ss using date-fns
                              const date = parse(timeValue, "HH:mm", new Date());
                              const formattedTime = format(date, "HH:mm:ss");
                              field.onChange(formattedTime);
                            } catch {
                              // If parsing fails, append :00 to make it HH:mm:ss
                              field.onChange(timeValue + ":00");
                            }
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_hours_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ساعات العمل اليومية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="8"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="late_threshold_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد التأخير (بالدقائق)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="15"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_vacation_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أيام الإجازة السنوية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="21"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probation_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ انتهاء فترة التجربة</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(
                            date
                              ? date.toISOString().split("T")[0]
                              : ""
                          );
                        }}
                        placeholder="اختر تاريخ انتهاء فترة التجربة"
                        showLabel={false}
                        disabled={isPending}
                        allowFutureDates={true}
                        allowPastDates={true}
                        buttonClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Bank Information Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg font-semibold">معلومات البنك</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البنك</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم البنك" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الحساب</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الحساب البنكي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الآيبان</FormLabel>
                    <FormControl>
                      <Input placeholder="IBAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Emergency Contact Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-lg font-semibold">جهة الاتصال في حالات الطوارئ</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم جهة الاتصال" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الهاتف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صلة القرابة</FormLabel>
                    <FormControl>
                      <Input placeholder="صلة القرابة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>

          {/* Entity Assignments Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg font-semibold">التعيينات</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
            
            <div className="space-y-6">
              {/* Factories */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="factory_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المصانع</FormLabel>
                      <FormControl>
                        <FactoriesSelect
                          multi={true}
                          value={field.value || []}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Workshops */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="workshop_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الورش</FormLabel>
                      <FormControl>
                        <WorkshopsSelect
                          multi={true}
                          value={field.value || []}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Branches */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="branch_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفروع</FormLabel>
                      <FormControl>
                        <MultiBranchesSelect
                          multi={true}
                          value={field.value || []}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg font-semibold">ملاحظات إضافية</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ملاحظات إضافية..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          </div>

          {/* Submit Button */}
          <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
            <CardContent className="pt-6">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isPending}
                  size="lg"
                  className="min-w-[160px] h-12 font-semibold"
                >
                  إعادة تعيين
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  size="lg" 
                  className="min-w-[160px] h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      جاري الإنشاء...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      إنشاء موظف
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default CreateEmployee;
