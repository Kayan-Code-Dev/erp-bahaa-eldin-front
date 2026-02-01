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
import { useMutation } from "@tanstack/react-query";
import { useCreateDepartmentMutationOptions } from "@/api/v2/content-managment/depratments/departments.hooks";
import { TCreateDepartmentRequest } from "@/api/v2/content-managment/depratments/departments.types";
import { toast } from "sonner";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";

// Schema for the form
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  manager_id: z.coerce.number({ required_error: "معرف المدير مطلوب" }),
  is_active: z.boolean().default(true),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDepartmentModal({ open, onOpenChange }: Props) {
  const { mutate: createDepartment, isPending } = useMutation(
    useCreateDepartmentMutationOptions()
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateDepartmentRequest = {
      code: values.code,
      name: values.name,
      description: values.description || "",
      manager_id: values.manager_id,
      is_active: values.is_active,
      parent_id: values.parent_id ? Number(values.parent_id) : null,
    };

    createDepartment(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء القسم بنجاح", {
          description: "تمت إضافة القسم بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء القسم", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء قسم جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة قسم جديد للنظام.
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
                    <Input placeholder="DEPT-001" {...field} />
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
                    <Input placeholder="اسم القسم..." {...field} />
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
                    <Textarea placeholder="وصف القسم..." {...field} />
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
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

