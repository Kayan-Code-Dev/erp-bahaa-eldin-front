import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { TDepartment } from "@/api/v2/content-managment/depratments/departments.types";
import { useUpdateDepartmentMutationOptions } from "@/api/v2/content-managment/depratments/departments.hooks";
import { TUpdateDepartmentRequest } from "@/api/v2/content-managment/depratments/departments.types";
import { toast } from "sonner";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";

// Schema
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  manager_id: z.coerce.number({ required_error: "معرف المدير مطلوب" }),
  is_active: z.boolean().default(true),
});

type Props = {
  department: TDepartment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditDepartmentModal({ department, open, onOpenChange }: Props) {
  const { mutate: updateDepartment, isPending } = useMutation(
    useUpdateDepartmentMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      parent_id: "",
      manager_id: 0,
      is_active: true,
    },
  });

  // Load department data into form when modal opens
  useEffect(() => {
    if (department && open) {
      form.reset({
        code: department.code,
        name: department.name,
        description: department.description || "",
        parent_id: department.parent_id ? String(department.parent_id) : "",
        manager_id: department.manager_id,
        is_active: department.is_active,
      });
    }
  }, [department, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!department) return;

    const requestData: TUpdateDepartmentRequest = {
      code: values.code,
      name: values.name,
      description: values.description || "",
      manager_id: values.manager_id,
      is_active: values.is_active,
      parent_id: values.parent_id ? Number(values.parent_id) : null,
    };

    updateDepartment(
      { id: department.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث القسم بنجاح", {
            description: `تم تحديث القسم "${department.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث القسم", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل قسم: {department?.name}</DialogTitle>
          <DialogDescription>
            قم بتعديل البيانات وانقر "حفظ" لحفظ التغييرات.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكود</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم القسم</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Department */}
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم الأب (اختياري)</FormLabel>
                  <FormControl>
                    <DepartmentsSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="اختر القسم الأب..."
                      excludeIds={department ? [department.id] : []}
                      allowClear={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manager ID */}
            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>معرف المدير</FormLabel>
                  <FormControl>
                    <EmployeesSelect
                      params={{ per_page: 10, level: "branches_manager" }}
                      value={field.value && field.value > 0 ? field.value.toString() : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : 0)}
                      placeholder="اختر المدير..."
                      allowClear={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">الحالة</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      تفعيل أو تعطيل القسم
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      dir="ltr"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

