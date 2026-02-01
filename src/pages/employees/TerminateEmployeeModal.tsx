import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/custom/DatePicker";
import { useTerminateEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";
import { TEmployee } from "@/api/v2/employees/employees.types";

const formSchema = z.object({
  termination_date: z.string().min(1, { message: "تاريخ إنهاء الخدمة مطلوب" }),
  reason: z.string().min(1, { message: "سبب إنهاء الخدمة مطلوب" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  employee: TEmployee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function TerminateEmployeeModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const { mutate: terminateEmployee, isPending } = useMutation(
    useTerminateEmployeeQueryOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termination_date: "",
      reason: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    terminateEmployee(
      {
        id: employee.id,
        data: {
          termination_date: values.termination_date,
          reason: values.reason,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم إنهاء خدمة الموظف بنجاح", {
            description: `تم إنهاء خدمة ${employee.user.name} بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء إنهاء خدمة الموظف", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">إنهاء خدمة الموظف</DialogTitle>
          <DialogDescription className="text-center">
            تأكيد إنهاء خدمة الموظف: {employee.user.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="termination_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ إنهاء الخدمة *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        field.onChange(
                          date ? date.toISOString().split("T")[0] : ""
                        );
                      }}
                      placeholder="اختر تاريخ إنهاء الخدمة"
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب إنهاء الخدمة *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل سبب إنهاء الخدمة..."
                      className="min-h-[100px]"
                      {...field}
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
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "جاري المعالجة..." : "تأكيد إنهاء الخدمة"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

