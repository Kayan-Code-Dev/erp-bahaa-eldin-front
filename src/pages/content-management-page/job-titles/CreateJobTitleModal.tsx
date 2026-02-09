import { useCreateJobTitleMutationOptions } from "@/api/v2/content-managment/job-titles/job-titles.hooks";
import { TCreateJobTitleRequest } from "@/api/v2/content-managment/job-titles/job-titles.types";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesLevelsSelect } from "@/components/custom/job-titles-levels-select";
import { RolesSelect } from "@/components/custom/roles-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Schema for the form
const formSchema = z
  .object({
    code: z.string().min(1, { message: "الكود مطلوب" }),
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    description: z.string().optional(),
    department_id: z.string().min(1, { message: "القسم مطلوب" }),
    level: z.string().min(1, { message: "المستوى مطلوب" }),
    min_salary: z.coerce
      .number()
      .min(0, { message: "الراتب الأدنى يجب أن يكون أكبر من أو يساوي 0" }),
    max_salary: z.coerce
      .number()
      .min(0, { message: "الراتب الأعلى يجب أن يكون أكبر من أو يساوي 0" }),
    is_active: z.boolean().default(true),
    role_ids: z.array(z.string()).optional(),
  })
  .refine((data) => data.max_salary >= data.min_salary, {
    message: "الراتب الأعلى يجب أن يكون أكبر من أو يساوي الراتب الأدنى",
    path: ["max_salary"],
  });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateJobTitleModal({ open, onOpenChange }: Props) {
  const { mutate: createJobTitle, isPending: isCreating } = useMutation(
    useCreateJobTitleMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      department_id: "",
      level: "",
      min_salary: 0,
      max_salary: 0,
      is_active: true,
      role_ids: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateJobTitleRequest = {
      code: values.code,
      name: values.name,
      description: values.description || "",
      department_id: Number(values.department_id),
      level: values.level,
      min_salary: values.min_salary,
      max_salary: values.max_salary,
      is_active: values.is_active,
      role_ids: values.role_ids?.map((id) => Number(id)) || [],
    };

    createJobTitle(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المسمية الوظيفية بنجاح", {
          description: "تمت إضافة المسمية الوظيفية بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء المسمية الوظيفية", {
          description: error.message,
        });
      },
    });
  };

  const isPending = isCreating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">
            إنشاء مسمية وظيفية جديدة
          </DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة مسمية وظيفية جديدة للنظام.
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
                    <Input placeholder="JT-001" {...field} />
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
                  <FormLabel>اسم المسمية الوظيفية</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم المسمية الوظيفية..." {...field} />
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
                    <Textarea
                      placeholder="وصف المسمية الوظيفية..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم</FormLabel>
                  <FormControl>
                    <DepartmentsSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="اختر القسم..."
                      allowClear={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المستوى</FormLabel>
                  <FormControl>
                    <JobTitlesLevelsSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="اختر المستوى..."
                      allowClear={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Min Salary */}
            <FormField
              control={form.control}
              name="min_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الراتب الأدنى</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        field.onChange(val === "" ? 0 : Number(val) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Salary */}
            <FormField
              control={form.control}
              name="max_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الراتب الأعلى</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        field.onChange(val === "" ? 0 : Number(val) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Roles */}
            <FormField
              control={form.control}
              name="role_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصلاحيات (اختياري)</FormLabel>
                  <FormControl>
                    <RolesSelect
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="اختر الصلاحيات..."
                      allowClear={true}
                      multi={true}
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
                      تفعيل أو تعطيل المسمية الوظيفية
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
