import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
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
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesSelect } from "@/components/custom/JobTitlesSelect";
import { RolesSelect } from "@/components/custom/roles-select";
import { FactoriesSelect } from "@/components/custom/FactoriesSelect";
import { WorkshopsSelect } from "@/components/custom/WorkshopsSelect";
import { BranchesSelect as MultiBranchesSelect } from "@/components/custom/MultiBranchesSelect";
import {
  useUpdateEmployeeQueryOptions,
  useGetEmployeeAssignmentsQueryOptions,
} from "@/api/v2/employees/employees.hooks";
import {
  TUpdateEmployeeRequest,
  TEmployee,
  EMPLOYMENT_STATUS,
} from "@/api/v2/employees/employees.types";
import { TEntity } from "@/lib/types/entity.types";
import { Badge } from "@/components/ui/badge";

// Schema for the form - only fields that can be updated
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  department_id: z.string().optional(),
  job_title_id: z.string().optional(),
  employment_status: z
    .enum(EMPLOYMENT_STATUS as unknown as [string, ...string[]])
    .optional(),
  roles: z.array(z.string()).optional(),
  base_salary: z.string().optional(),
  factory_ids: z.array(z.string()).optional(),
  workshop_ids: z.array(z.string()).optional(),
  branch_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type EditEmployeeProps = {
  employee: TEmployee;
  onCancel: () => void;
  onSuccess: () => void;
};

const employmentStatusLabels: Record<string, string> = {
  active: "نشط",
  on_leave: "في إجازة",
  suspended: "معلق",
  terminated: "منتهي",
};

function EditEmployee({ employee, onCancel, onSuccess }: EditEmployeeProps) {
  const { mutate: updateEmployee, isPending } = useMutation(
    useUpdateEmployeeQueryOptions()
  );

  const { data: assignments } = useQuery({
    ...useGetEmployeeAssignmentsQueryOptions(employee.id),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee.user.name,
      email: employee.user.email,
      department_id: employee.department_id?.toString() || "",
      job_title_id: employee.job_title_id?.toString() || "",
      employment_status: employee.employment_status,
      roles: employee.user.roles?.map((r) => r.id.toString()) || [],
      base_salary: employee.base_salary?.toString() || "",
      factory_ids: [],
      workshop_ids: [],
      branch_ids: employee.branches?.map((b) => b.id.toString()) || [],
    },
  });

  // Update form when assignments are loaded
  useEffect(() => {
    if (assignments) {
      const factoryIds =
        assignments
          .filter((a) => a.entity_type === "factory")
          .map((a) => a.entity_id.toString()) || [];
      const workshopIds =
        assignments
          .filter((a) => a.entity_type === "workshop")
          .map((a) => a.entity_id.toString()) || [];
      const branchIds =
        assignments
          .filter((a) => a.entity_type === "branch")
          .map((a) => a.entity_id.toString()) || [];

      form.reset({
        name: employee.user.name,
        email: employee.user.email,
        department_id: employee.department_id?.toString() || "",
        job_title_id: employee.job_title_id?.toString() || "",
        employment_status: employee.employment_status,
        roles: employee.user.roles?.map((r) => r.id.toString()) || [],
        base_salary: employee.base_salary?.toString() || "",
        factory_ids: factoryIds,
        workshop_ids: workshopIds,
        branch_ids: branchIds.length > 0 ? branchIds : employee.branches?.map((b) => b.id.toString()) || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const onSubmit = (values: FormValues) => {
    // Build entity_assignments array
    const entityAssignments: TUpdateEmployeeRequest["entity_assignments"] = [];

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

    const requestData: TUpdateEmployeeRequest = {
      name: values.name,
      email: values.email,
      department_id: values.department_id
        ? Number(values.department_id)
        : undefined,
      job_title_id: values.job_title_id
        ? Number(values.job_title_id)
        : undefined,
      base_salary: values.base_salary
        ? Number(values.base_salary)
        : undefined,
      employment_status: values.employment_status as TUpdateEmployeeRequest["employment_status"],
      roles: values.roles ? values.roles.map(Number) : undefined,
      entity_assignments:
        entityAssignments.length > 0 ? entityAssignments : undefined,
    };

    updateEmployee(
      { id: employee.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الموظف بنجاح", {
            description: "تم تحديث بيانات الموظف بنجاح.",
          });
          onSuccess();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الموظف", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">تعديل بيانات الموظف</h1>
        <p className="text-muted-foreground">
          تعديل معلومات الموظف: {employee.user.name}
        </p>
        <div className="mt-2">
          <Badge variant="outline">كود الموظف: {employee.employee_code}</Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4 border rounded-lg p-6">
            <h2 className="text-lg font-semibold">المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم *</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الموظف" {...field} />
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
                    <FormLabel>البريد الإلكتروني *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Job Information Section */}
          <div className="space-y-4 border rounded-lg p-6">
            <h2 className="text-lg font-semibold">معلومات الوظيفة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة التوظيف</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة التوظيف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {employmentStatusLabels[status] || status}
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
            </div>
          </div>

          {/* Salary Information Section */}
          <div className="space-y-4 border rounded-lg p-6">
            <h2 className="text-lg font-semibold">معلومات الراتب</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Entity Assignments Section */}
          <div className="space-y-4 border rounded-lg p-6">
            <h2 className="text-lg font-semibold">التعيينات</h2>

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
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري التحديث..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditEmployee;
