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
import { useCreateEmployeeCustodyMutationOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TCreateEmployeeCustody, TEmployeeCustodyConditionOnAssignment } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { toast } from "sonner";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeCustodyTypesSelect } from "@/components/custom/EmployeeCustodyTypesSelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONDITION_OPTIONS: { value: TEmployeeCustodyConditionOnAssignment; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "good", label: "جيد" },
  { value: "fair", label: "مقبول" },
  { value: "poor", label: "ضعيف" },
];

const formSchema = z.object({
  employee_id: z.string().min(1, { message: "الموظف مطلوب" }),
  type: z.string().min(1, { message: "نوع الضمان مطلوب" }),
  name: z.string().min(1, { message: "الاسم مطلوب" }),
  description: z.string().optional(),
  serial_number: z.string().min(1, { message: "الرقم التسلسلي مطلوب" }),
  asset_tag: z.string().min(1, { message: "علامة الأصل مطلوبة" }),
  value: z.number().min(0, { message: "القيمة يجب أن تكون أكبر من أو تساوي صفر" }),
  condition_on_assignment: z.enum(["new", "good", "fair", "poor"]),
  assigned_date: z.date({ required_error: "تاريخ التعيين مطلوب" }),
  expected_return_date: z.date({ required_error: "تاريخ الإرجاع المتوقع مطلوب" }),
  notes: z.string().optional(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeCustodyModal({ open, onOpenChange }: Props) {
  const { mutate: createEmployeeCustody, isPending } = useMutation(
    useCreateEmployeeCustodyMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      type: "",
      name: "",
      description: "",
      serial_number: "",
      asset_tag: "",
      value: 0,
      condition_on_assignment: "good",
      assigned_date: undefined,
      expected_return_date: undefined,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateEmployeeCustody = {
      employee_id: Number(values.employee_id),
      type: values.type,
      name: values.name,
      description: values.description || "",
      serial_number: values.serial_number,
      asset_tag: values.asset_tag,
      value: values.value,
      condition_on_assignment: values.condition_on_assignment,
      assigned_date: values.assigned_date.toISOString().split("T")[0],
      expected_return_date: values.expected_return_date.toISOString().split("T")[0],
      notes: values.notes || "",
    };

    createEmployeeCustody(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الضمان بنجاح", {
          description: "تمت إضافة الضمان بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الضمان", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء ضمان جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة ضمان جديد للموظف.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف</FormLabel>
                    <FormControl>
                      <EmployeesSelect
                        params={{ per_page: 10 }}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                        placeholder="اختر الموظف..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الضمان</FormLabel>
                    <FormControl>
                      <EmployeeCustodyTypesSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                        placeholder="اختر نوع الضمان..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الضمان" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف الضمان..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم التسلسلي</FormLabel>
                    <FormControl>
                      <Input placeholder="الرقم التسلسلي" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>علامة الأصل</FormLabel>
                    <FormControl>
                      <Input placeholder="علامة الأصل" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val === "" ? 0 : Number(val) || 0);
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition_on_assignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة عند التعيين</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigned_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ التعيين</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر تاريخ التعيين"
                        showLabel={false}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_return_date"
                render={({ field }) => {
                  const assignedDate = form.watch("assigned_date");
                  return (
                    <FormItem>
                      <FormLabel>تاريخ الإرجاع المتوقع</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اختر تاريخ الإرجاع المتوقع"
                          showLabel={false}
                          disabled={isPending}
                          minDate={assignedDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
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

