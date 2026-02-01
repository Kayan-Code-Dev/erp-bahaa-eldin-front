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
import { useCreateLateEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { TCreateLateEmployeeDeductionRequest } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { toast } from "sonner";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { DatePicker } from "@/components/custom/DatePicker";

const formSchema = z.object({
  employee_id: z.string({ required_error: "الموظف مطلوب" }),
  date: z.date({ required_error: "التاريخ مطلوب" }),
  late_minutes: z.string().min(1, { message: "دقائق التأخير مطلوبة" }).refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "دقائق التأخير يجب أن تكون رقماً أكبر من الصفر" }
  ),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateLateEmployeeDeductionModal({
  open,
  onOpenChange,
}: Props) {
  const { mutate: createLateDeduction, isPending } = useMutation(
    useCreateLateEmployeeDeductionMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      date: undefined,
      late_minutes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert Date object to ISO string format (YYYY-MM-DD)
    const formatDateToString = (date: Date | undefined): string => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };

    const requestData: TCreateLateEmployeeDeductionRequest = {
      employee_id: Number(values.employee_id),
      date: formatDateToString(values.date),
      late_minutes: Number(values.late_minutes),
    };

    createLateDeduction(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء خصم التأخير بنجاح", {
          description: "تمت إضافة خصم التأخير بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء خصم التأخير", {
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة خصم تأخير</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة خصم تأخير للموظف.
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

            {/* Date and Late Minutes */}
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="late_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دقائق التأخير *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="دقائق التأخير..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isPending ? "جاري الحفظ..." : "إضافة خصم التأخير"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

