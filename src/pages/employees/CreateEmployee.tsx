import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  User,
  Shield,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RolesSelect } from "@/components/custom/roles-select";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { useCreateEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";
import { TCreateEmployeeRequest } from "@/api/v2/employees/employees.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const COMMISSION_TYPES = ["percentage", "fixed"] as const;

const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب (حرفان على الأقل)" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z
    .string()
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  hire_date: z.string().min(1, { message: "تاريخ التوظيف مطلوب" }),

  branch_id: z.string().min(1, { message: "يجب اختيار الفرع" }),

  roles: z.array(z.string()).optional(),
  manager_id: z.string().optional(),

  base_salary: z.string().min(1, { message: "الراتب الأساسي مطلوب" }),
  transport_allowance: z.string().optional(),
  housing_allowance: z.string().optional(),
  other_allowances: z.string().optional(),
  overtime_rate: z.string().optional(),
  commission_type: z.enum(COMMISSION_TYPES).optional(),
  commission_rate: z.string().optional(),

  annual_vacation_days: z.string().optional(),
  probation_end_date: z.string().optional(),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  work_hours_per_day: z.string().optional(),
  late_threshold_minutes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  email: "",
  password: "",
  hire_date: "",
  branch_id: "",
  roles: [],
  manager_id: "",
  base_salary: "",
  transport_allowance: "",
  housing_allowance: "",
  other_allowances: "",
  overtime_rate: "",
  commission_type: undefined,
  commission_rate: "",
  annual_vacation_days: "",
  probation_end_date: "",
  work_start_time: "",
  work_end_time: "",
  work_hours_per_day: "",
  late_threshold_minutes: "",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTimeForInput(value: string): string {
  if (!value) return "";
  try {
    if (value.includes(":")) {
      const parts = value.split(":");
      if (parts.length === 3)
        return format(parse(value, "HH:mm:ss", new Date()), "HH:mm");
      if (parts.length === 2) return value;
    }
    return format(parse(value, "HH:mm:ss", new Date()), "HH:mm");
  } catch {
    return value.includes(":") ? value.split(":").slice(0, 2).join(":") : "";
  }
}

function formatTimeForApi(value: string): string {
  if (!value) return "";
  try {
    return format(parse(value, "HH:mm", new Date()), "HH:mm:ss");
  } catch {
    return value + ":00";
  }
}

function numericOnly(v: string) {
  return v.replace(/[^0-9.]/g, "");
}

function intOnly(v: string) {
  return v.replace(/[^0-9]/g, "");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CreateEmployee() {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: createEmployee, isPending } = useMutation(
    useCreateEmployeeQueryOptions(),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const commissionType = useWatch({
    control: form.control,
    name: "commission_type",
  });

  // ---- submit ----
  const onSubmit = (values: FormValues) => {
    const requestData: TCreateEmployeeRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      hire_date: values.hire_date,
      branch_ids: [Number(values.branch_id)],
      roles: values.roles?.length ? values.roles.map(Number) : undefined,
      manager_id: values.manager_id ? Number(values.manager_id) : undefined,
      base_salary: Number(values.base_salary),
      transport_allowance: values.transport_allowance
        ? Number(values.transport_allowance)
        : undefined,
      housing_allowance: values.housing_allowance
        ? Number(values.housing_allowance)
        : undefined,
      other_allowances: values.other_allowances
        ? Number(values.other_allowances)
        : undefined,
      overtime_rate: values.overtime_rate
        ? Number(values.overtime_rate)
        : undefined,
      commission_rate: values.commission_rate
        ? Number(values.commission_rate)
        : undefined,
      annual_vacation_days: values.annual_vacation_days
        ? Number(values.annual_vacation_days)
        : undefined,
      probation_end_date: values.probation_end_date || undefined,
      work_start_time: values.work_start_time
        ? formatTimeForApi(values.work_start_time)
        : undefined,
      work_end_time: values.work_end_time
        ? formatTimeForApi(values.work_end_time)
        : undefined,
      work_hours_per_day: values.work_hours_per_day
        ? Number(values.work_hours_per_day)
        : undefined,
      late_threshold_minutes: values.late_threshold_minutes
        ? Number(values.late_threshold_minutes)
        : undefined,
    };

    createEmployee(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الموظف بنجاح", {
          description: "تمت إضافة الموظف بنجاح للنظام.",
        });
        form.reset(DEFAULT_VALUES);
      },
      onError: (error: { message?: string }) => {
        toast.error("حدث خطأ أثناء إنشاء الموظف", {
          description: error?.message,
        });
      },
    });
  };

  // ---- render ----
  return (
    <div className="container mx-auto py-8" dir="rtl">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            إنشاء موظف جديد
          </h1>
          <p className="text-sm text-muted-foreground">
            املأ البيانات المطلوبة لإضافة موظف جديد للنظام
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                البيانات الأساسية
              </CardTitle>
              <CardDescription>الحقول المطلوبة لإنشاء الحساب</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الاسم <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="اسم الموظف"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        البريد الإلكتروني{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        كلمة المرور{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                            disabled={isPending}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hire date */}
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        تاريخ التوظيف{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value
                              ? parse(field.value, "yyyy-MM-dd", new Date())
                              : undefined
                          }
                          onChange={(d) =>
                            field.onChange(
                              d ? format(d, "yyyy-MM-dd") : "",
                            )
                          }
                          placeholder="اختر تاريخ التوظيف"
                          showLabel={false}
                          disabled={isPending}
                          allowFutureDates
                          allowPastDates
                          buttonClassName="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch (required - single) */}
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        الفرع <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <BranchesSelect
                          value={field.value ?? ""}
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                الصلاحيات
              </CardTitle>
              <CardDescription>
                تحديد صلاحيات الموظف والمدير المباشر (اختياري)
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Roles */}
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصلاحيات</FormLabel>
                      <FormControl>
                        <RolesSelect
                          multi
                          value={field.value || []}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manager */}
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدير المباشر (اختياري)</FormLabel>
                      <FormControl>
                        <EmployeesSelect
                          params={{ per_page: 20 }}
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                معلومات الراتب
              </CardTitle>
              <CardDescription>
                الراتب الأساسي مطلوب، والبدلات اختيارية
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Base salary (required) */}
                <FormField
                  control={form.control}
                  name="base_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الراتب الأساسي{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(numericOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transport */}
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
                          onChange={(e) =>
                            field.onChange(numericOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Housing */}
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
                          onChange={(e) =>
                            field.onChange(numericOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Other allowances */}
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
                          onChange={(e) =>
                            field.onChange(numericOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Overtime */}
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
                          onChange={(e) =>
                            field.onChange(numericOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission type */}
                <FormField
                  control={form.control}
                  name="commission_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع العمولة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع العمولة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission rate */}
                {commissionType && (
                  <FormField
                    control={form.control}
                    name="commission_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {commissionType === "percentage"
                            ? "نسبة العمولة (%)"
                            : "مبلغ العمولة"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              commissionType === "percentage" ? "10" : "500"
                            }
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(numericOnly(e.target.value))
                            }
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                جدول العمل
              </CardTitle>
              <CardDescription>
                أوقات العمل والإجازات (اختياري)
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Work start */}
                <FormField
                  control={form.control}
                  name="work_start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وقت بدء العمل</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={parseTimeForInput(field.value ?? "")}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work end */}
                <FormField
                  control={form.control}
                  name="work_end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وقت انتهاء العمل</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={parseTimeForInput(field.value ?? "")}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hours per day */}
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
                          onChange={(e) =>
                            field.onChange(intOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Late threshold */}
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
                          onChange={(e) =>
                            field.onChange(intOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Annual vacation */}
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
                          onChange={(e) =>
                            field.onChange(intOnly(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Probation end */}
                <FormField
                  control={form.control}
                  name="probation_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء فترة التجربة</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value
                              ? parse(field.value, "yyyy-MM-dd", new Date())
                              : undefined
                          }
                          onChange={(d) =>
                            field.onChange(
                              d ? format(d, "yyyy-MM-dd") : "",
                            )
                          }
                          placeholder="اختر التاريخ"
                          showLabel={false}
                          disabled={isPending}
                          allowFutureDates
                          allowPastDates
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

          {/* ───────────────── Submit ───────────────── */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(DEFAULT_VALUES)}
              disabled={isPending}
              className="min-w-[120px]"
            >
              إعادة تعيين
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
        </form>
      </Form>
    </div>
  );
}

export default CreateEmployee;
