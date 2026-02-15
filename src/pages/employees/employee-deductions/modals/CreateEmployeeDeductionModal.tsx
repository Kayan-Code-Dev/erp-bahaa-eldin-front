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
import { useCreateEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { TCreateEmployeeDeductionRequest } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { toast } from "sonner";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeDeductionTypesSelect } from "@/components/custom/employee-deduction-types-select";
import { DatePicker } from "@/components/custom/DatePicker";

const formSchema = z.object({
  employee_id: z.string({ required_error: "الموظف مطلوب" }),
  type: z.string({ required_error: "نوع الخصم مطلوب" }),
  reason: z.string().min(1, { message: "السبب مطلوب" }),
  description: z.string().optional(),
  amount: z.string().min(1, { message: "المبلغ مطلوب" }).refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "المبلغ يجب أن يكون رقماً أكبر من الصفر" }
  ),
  date: z.date({ required_error: "التاريخ مطلوب" }),
  notes: z.string().optional(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeDeductionModal({
  open,
  onOpenChange,
}: Props) {
  const { mutate: createDeduction, isPending } = useMutation(
    useCreateEmployeeDeductionMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      type: "",
      reason: "",
      description: "",
      amount: "",
      date: undefined,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert Date object to ISO string format (YYYY-MM-DD)
    const formatDateToString = (date: Date | undefined): string => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };

    const requestData: TCreateEmployeeDeductionRequest = {
      employee_id: Number(values.employee_id),
      type: values.type,
      reason: values.reason,
      description: values.description || "",
      amount: Number(values.amount),
      date: formatDateToString(values.date),
      notes: values.notes || "",
    };

    createDeduction(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الخصم بنجاح", {
          description: "تمت إضافة الخصم بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الخصم", {
          description: error.message,
        });
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة خصم جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة خصم جديد للنظام.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف *</FormLabel>
                  <FormControl>
                    <EmployeesSelect
                      params={{ per_page: 10 }}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر الموظف..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الخصم *</FormLabel>
                  <FormControl>
                    <EmployeeDeductionTypesSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر نوع الخصم..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السبب *</FormLabel>
                  <FormControl>
                    <Input placeholder="سبب الخصم..." {...field} />
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
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف الخصم..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="المبلغ..."
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر التاريخ"
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ملاحظات إضافية..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : "إضافة الخصم"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

