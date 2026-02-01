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
import { TJobTitle } from "@/api/v2/content-managment/job-titles/job-titles.types";
import { useUpdateJobTitleMutationOptions } from "@/api/v2/content-managment/job-titles/job-titles.hooks";
import { TUpdateJobTitleRequest } from "@/api/v2/content-managment/job-titles/job-titles.types";
import { toast } from "sonner";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesLevelsSelect } from "@/components/custom/job-titles-levels-select";

// Schema
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  description: z.string().optional(),
  department_id: z.string().min(1, { message: "القسم مطلوب" }),
  level: z.string().min(1, { message: "المستوى مطلوب" }),
  min_salary: z.coerce.number().min(0, { message: "الراتب الأدنى يجب أن يكون أكبر من أو يساوي 0" }),
  max_salary: z.coerce.number().min(0, { message: "الراتب الأعلى يجب أن يكون أكبر من أو يساوي 0" }),
  is_active: z.boolean().default(true),
}).refine((data) => data.max_salary >= data.min_salary, {
  message: "الراتب الأعلى يجب أن يكون أكبر من أو يساوي الراتب الأدنى",
  path: ["max_salary"],
});

type Props = {
  jobTitle: TJobTitle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditJobTitleModal({ jobTitle, open, onOpenChange }: Props) {
  const { mutate: updateJobTitle, isPending } = useMutation(
    useUpdateJobTitleMutationOptions()
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
    },
  });

  // Load job title data into form when modal opens
  useEffect(() => {
    if (jobTitle && open) {
      form.reset({
        code: jobTitle.code,
        name: jobTitle.name,
        description: jobTitle.description || "",
        department_id: String(jobTitle.department_id),
        level: jobTitle.level,
        min_salary: jobTitle.min_salary,
        max_salary: jobTitle.max_salary,
        is_active: jobTitle.is_active,
      });
    }
  }, [jobTitle, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!jobTitle) return;

    const requestData: TUpdateJobTitleRequest = {
      code: values.code,
      name: values.name,
      description: values.description || "",
      department_id: Number(values.department_id),
      level: values.level,
      min_salary: values.min_salary,
      max_salary: values.max_salary,
      is_active: values.is_active,
      role_ids: jobTitle.roles.map((role) => role.id),
    };

    updateJobTitle(
      { id: jobTitle.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المسمية الوظيفية بنجاح", {
            description: `تم تحديث المسمية الوظيفية "${jobTitle.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث المسمية الوظيفية", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>تعديل مسمية وظيفية: {jobTitle?.name}</DialogTitle>
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
                  <FormLabel>اسم المسمية الوظيفية</FormLabel>
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
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

