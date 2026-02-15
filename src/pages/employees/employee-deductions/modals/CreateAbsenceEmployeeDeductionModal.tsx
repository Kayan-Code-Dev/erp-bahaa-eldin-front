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
import { useCreateAbsenceEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { TCreateAbsenceEmployeeDeductionRequest } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { toast } from "sonner";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { DatePicker } from "@/components/custom/DatePicker";

const formSchema = z.object({
  employee_id: z.string({ required_error: "الموظف مطلوب" }),
  date: z.date({ required_error: "التاريخ مطلوب" }),
  reason: z.string().min(1, { message: "سبب الغياب مطلوب" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAbsenceEmployeeDeductionModal({
  open,
  onOpenChange,
}: Props) {
  const { mutate: createAbsenceDeduction, isPending } = useMutation(
    useCreateAbsenceEmployeeDeductionMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      date: undefined,
      reason: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert Date object to ISO string format (YYYY-MM-DD)
    const formatDateToString = (date: Date | undefined): string => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };

    const requestData: TCreateAbsenceEmployeeDeductionRequest = {
      employee_id: Number(values.employee_id),
      date: formatDateToString(values.date),
      reason: values.reason,
    };

    createAbsenceDeduction(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء خصم الغياب بنجاح", {
          description: "تمت إضافة خصم الغياب بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء خصم الغياب", {
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة خصم غياب</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة خصم غياب للموظف.
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

            {/* Date */}
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

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الغياب *</FormLabel>
                  <FormControl>
                    <Input placeholder="سبب الغياب..." {...field} />
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
                {isPending ? "جاري الحفظ..." : "إضافة خصم الغياب"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

